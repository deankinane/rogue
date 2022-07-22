import { TransactionRequest, TransactionResponse, TransactionReceipt } from "@ethersproject/providers";
import { BigNumber, Contract, ethers } from "ethers";
import SimpleCrypto from "simple-crypto-js";
import { ParamTypes } from "./constants";
import { CustomParam, TransactionState } from "./GlobalState";
import {INodeRecord} from "../application-state/settingsStore/ISettingsState";
import MintContract from "./MintContract";
import { ROGUE_SESSION_ADDRESS } from "../application-state/userContext/UserContextProvider";
import { IWallet } from "../application-state/walletStore/WalletInterface"
import { Interface } from "ethers/lib/utils";
import { ITransaction, ITransactionGroup, TransactionStatus } from "../common/ITransaction";

async function getReadValue(mintContract : MintContract, func:string, node: INodeRecord) : Promise<any> {
  const provider = new ethers.providers.JsonRpcProvider(node.rpcUrl);

  if (!mintContract.abi) throw new Error("Error loading contract");

  const contract = new Contract(mintContract.address, mintContract.abi, provider)
  return contract.functions[func]();
}

async function getWalletBalance(address:string) : Promise<string> {
  const provider = new ethers.providers.Web3Provider(window.ethereum);  
  const balance = await provider.getBalance(address)
  return parseFloat(ethers.utils.formatEther(balance)).toFixed(4);
}

export interface TransactionRequestGroup {
  wallet: IWallet,
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
    const wallet = settings.selectedWallets[w]

    if(settings.customParams) {
      settings.mintFunction.inputs.forEach((x) => {
        const param = settings.functionParams.find(f => f.name === x.name);
        params.push(getParamValue(param, wallet.publicKey));
      })
    }
    else if(settings.mintFunction.inputs.length === 1) {
      params.push(settings.unitsPerTxn);
    }
    
    const data = mintContract.abi.encodeFunctionData(settings.mintFunction, params);

    const transactions = new Array<TransactionRequest>();
    const etherWallet = new ethers.Wallet(simpleCrypto.decrypt(wallet.privateKey).toString(), provider);
    const base_nonce = await provider.getTransactionCount(etherWallet.address);

    const gasLimit = await etherWallet.estimateGas({
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
      wallet: wallet,
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
  wallet: IWallet,
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

async function sendTransaction(txn: TransactionRequest, wallet:IWallet, node:INodeRecord) : Promise<TransactionResponse> {
  const provider = new ethers.providers.JsonRpcProvider(node.rpcUrl);
  const sig = window.sessionStorage.getItem(ROGUE_SESSION_ADDRESS);
  const simpleCrypto = new SimpleCrypto(sig);
  const signer = new ethers.Wallet(simpleCrypto.decrypt(wallet.privateKey).toString());
  return provider.sendTransaction(await signer.signTransaction(txn));
}

async function sendTransactionGroups(
  groups: ITransactionGroup[], 
  node: INodeRecord,
  maxFeePerGas?: string,
  maxPriorityFeePerGas?: string) : Promise<ITransactionGroup[]> {

    const provider = new ethers.providers.JsonRpcProvider(node.rpcUrl);

    for(let g=0; g<groups.length; g++) {
      const group = groups[g];
      for(let t=0; t<groups[g].transactions.length; t++) {
        const trans = group.transactions[t];

        if (maxFeePerGas)
          trans.request.maxFeePerGas = BigNumber.from(maxFeePerGas)
        
        if(maxPriorityFeePerGas)
          trans.request.maxPriorityFeePerGas = BigNumber.from(maxPriorityFeePerGas)

        trans.status = TransactionStatus.pending;
        trans.promise = provider.sendTransaction(await group.signer.signTransaction(trans.request))
      }
    }

    return groups;
  }

async function prepareTransactionGroups(
  mintContract: MintContract, 
  settings: TransactionState, 
  node: INodeRecord) : Promise<ITransactionGroup[]> {
  const resultGroup = new Array<ITransactionGroup>()
  const provider = new ethers.providers.JsonRpcProvider(node.rpcUrl);
  const contractInterface = new Interface(mintContract.abiJson)
  const mintFunctionName = `${settings.mintFunction.name}(${settings.mintFunction.inputs.map(i => i.type).join()})`
  const mintFunction = contractInterface.functions[mintFunctionName]

  const txnsPerWallet = settings.transactionsPerWallet || 1;
  const sig = window.sessionStorage.getItem(ROGUE_SESSION_ADDRESS);
  const simpleCrypto = new SimpleCrypto(sig);

  const totalMintCost = ethers.utils.parseEther(`${settings.totalCost || 0}`);

  for(let w=0; w<settings.selectedWallets.length; w++) {
    const params = new Array<any>();
    const wallet = settings.selectedWallets[w]

    if(settings.customParams) {
      mintFunction.inputs.forEach((x) => {
        const param = settings.functionParams.find(f => f.name === x.name);
        params.push(getParamValue(param, wallet.publicKey));
      })
    }
    else if(mintFunction.inputs.length === 1) {
      params.push(settings.unitsPerTxn);
    }
    
    const data = contractInterface.encodeFunctionData(mintFunction, params);

    const etherWallet = new ethers.Wallet(simpleCrypto.decrypt(wallet.privateKey).toString(), provider);
    const base_nonce = await provider.getTransactionCount(etherWallet.address);
    const transactionGroup: ITransactionGroup = {
      wallet: wallet,
      signer: etherWallet,
      transactions: new Array<ITransaction>()
    }

    for(let i=0; i<txnsPerWallet; i++) {
      const req: TransactionRequest = {
        to: settings.contractAddress,
        value: totalMintCost,
        nonce: base_nonce + i,
        data: data,
        chainId: node.chainId,
        type: 2,
        gasLimit: 200000,
        maxFeePerGas: 0,
        maxPriorityFeePerGas: 0
      }

      const txn: ITransaction = {
        request: req,
        status: TransactionStatus.pending
      }

      transactionGroup.transactions.push(txn)
    }

    resultGroup.push(transactionGroup)
  }

  return resultGroup
}

async function disperseEth(wallets: string[], totalAmount: number): Promise<TransactionReceipt> {
  
  var abi = new Interface([
    'function disperse(address[] calldata wallets) payable external'
  ])
  var provider = new ethers.providers.Web3Provider(window.ethereum)
  var contract = new Contract('0x2f42E899e61e8e959DbEa546b0c39589D49834Ed', abi, provider.getSigner())
  
  const gas = await contract.estimateGas.disperse(wallets, {
    value: ethers.utils.parseEther(totalAmount.toString())
  })

  const tx = await contract.disperse(wallets, {
    value: ethers.utils.parseEther(totalAmount.toString()),
    gasLimit: gas
  })

  const rec = await tx.wait()
  return rec;
}

export {getReadValue, prepareTransactions, sendTransactions, sendTransaction, getWalletBalance, prepareTransactionGroups, sendTransactionGroups, disperseEth};
