import { TransactionRequest, TransactionResponse } from "@ethersproject/providers";
import { Bytes, Contract, ethers } from "ethers";
import SimpleCrypto from "simple-crypto-js";
import { ROGUE_SESSION_ADDRESS } from "../hooks/useWalletConnected";
import { ParamTypes } from "./constants";
import { CustomParam, TransactionState } from "./GlobalState";
import INodeRecord from "./INodeRecord";
import IWalletRecord from "./IWalletRecord";
import MintContract from "./MintContract";

async function getReadValue(mintContract : MintContract, func:string, node: INodeRecord) : Promise<any> {
  const provider = new ethers.providers.JsonRpcProvider(node.rpcUrl);

  if (!mintContract.abi) throw new Error("Error loading contract");

  const contract = new Contract(mintContract.address, mintContract.abi, provider)
  return contract.functions[func]();
}

async function getWalletBalance(address:string, node: INodeRecord) : Promise<any> {
  const provider = new ethers.providers.JsonRpcProvider(node.rpcUrl);  
  const balance = await provider.getBalance(address)
  return ethers.utils.formatEther(balance);
}

export interface TransactionRequestGroup {
  wallet: IWalletRecord,
  transactions: TransactionRequest[]
}

async function prepareTransactions (mintContract: MintContract, settings: TransactionState, node: INodeRecord) : Promise<TransactionRequestGroup[]> {
  if (!(settings.mintFunction && settings.contractAddress
    && settings.unitsPerTxn && settings.maxGasFee && settings.selectedWallets
    && settings.transactionsPerWallet &&  mintContract.abi)) {
      console.log(settings.contractAddress)
      throw new Error("Invalid Transaction Configuration");
  }
  
  const result = new Array<TransactionRequestGroup>();
  const provider = new ethers.providers.JsonRpcProvider(node.rpcUrl);

  const totalMintCost = ethers.utils.parseEther(`${settings.totalCost || 0}`);
  
  
  const txnsPerWallet = settings.transactionsPerWallet || 1;
  const sig = window.sessionStorage.getItem(ROGUE_SESSION_ADDRESS);
  const simpleCrypto = new SimpleCrypto(sig);

  for(let w=0; w<settings.selectedWallets.length; w++) {
    const params = new Array<any>();

    if(settings.customParams) {
      settings.mintFunction.inputs.forEach((x) => {
        const param = settings.functionParams.find(f => f.name === x.name);
        params.push(getParamValue(param, settings.selectedWallets[w].publicKey));
      })
    }
    else if(settings.mintFunction.inputs.length === 1) {
      params.push(settings.unitsPerTxn);
    }
    
    const data = mintContract.abi.encodeFunctionData(settings.mintFunction, params);

    const transactions = new Array<TransactionRequest>();
    const wallet = new ethers.Wallet(simpleCrypto.decrypt(settings.selectedWallets[w].privateKey).toString(), provider);
    const base_nonce = await provider.getTransactionCount(wallet.address);

    const gasLimit = await wallet.estimateGas({
      to: settings.contractAddress, 
      data: data,
      value: totalMintCost
    });
  
    for(let i=0; i<txnsPerWallet; i++) {
      transactions.push({
        to: settings.contractAddress,
        value: totalMintCost,
        nonce: base_nonce + i,
        data: data,
        chainId: node.chainId,
        type: 2,
        gasLimit: gasLimit.mul(11).div(10),
        maxFeePerGas: ethers.utils.parseUnits(`${settings.maxGasFee}`, "gwei"),
        maxPriorityFeePerGas: ethers.utils.parseUnits(`${settings.maxGasFee}`, "gwei")
      })
    }

    result.push({
      wallet: settings.selectedWallets[w],
      transactions: transactions
    })
  }

  return result;
}

function getParamValue(param?: CustomParam, address?: string) {
  if (param === undefined) return undefined;

  if (param.type === ParamTypes.bytes32) {
    if (param.isArray) {
      const data: string = param.value.replace('[', '').replace(']', '');
      const byteStrings = data.split(',').filter(x => x !== '');
      return byteStrings;
    }
    
    return param.value;
  }

  if (param.type === ParamTypes.address) {
    if(param.isArray) {
      return param.value.split(',').map(x => x.trim());
    }

    if(param.autoWalletAddress) return address;
    
    return param.value;
  }
  
  if (param.type === ParamTypes.uint256) {
    if(param.isArray) {
      return param.value.split(',').map(x => parseInt(x.trim()));
    }
    
    return parseInt(param.value);
  }

  return param.value;
}

export interface PendingTransactionGroup {
  wallet: IWalletRecord,
  transactions: Promise<TransactionResponse>[]
  resolved: number[]
}

async function sendTransactions(groups: TransactionRequestGroup[], node:INodeRecord) : Promise<PendingTransactionGroup[]> {
  const provider = new ethers.providers.JsonRpcProvider(node.rpcUrl);
  const result = new Array<PendingTransactionGroup>();
  const sig = window.sessionStorage.getItem(ROGUE_SESSION_ADDRESS);
  const simpleCrypto = new SimpleCrypto(sig);

  for(let g=0; g<groups.length; g++) {
    const responses = new Array<Promise<TransactionResponse>>();
    const signer = new ethers.Wallet(simpleCrypto.decrypt(groups[g].wallet.privateKey).toString());

    for(let i=0; i<groups[g].transactions.length; i++) {
      responses.push(provider.sendTransaction(await signer.signTransaction(groups[g].transactions[i])));
    }

    result.push({
      wallet: groups[g].wallet,
      transactions: responses,
      resolved: new Array<number>()
    })
  }

  return result;
}

async function sendTransaction(txn: TransactionRequest, wallet:IWalletRecord, node:INodeRecord) : Promise<TransactionResponse> {
  const provider = new ethers.providers.JsonRpcProvider(node.rpcUrl);
  const sig = window.sessionStorage.getItem(ROGUE_SESSION_ADDRESS);
  const simpleCrypto = new SimpleCrypto(sig);
  const signer = new ethers.Wallet(simpleCrypto.decrypt(wallet.privateKey).toString());
  return provider.sendTransaction(await signer.signTransaction(txn));
}


export {getReadValue, prepareTransactions, sendTransactions, sendTransaction, getWalletBalance};
