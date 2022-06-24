import { TransactionRequest, TransactionResponse } from "@ethersproject/providers";
import { Contract, ethers } from "ethers";
import SimpleCrypto from "simple-crypto-js";
import { ROGUE_SESSION_SIGNATURE } from "../hooks/useSignedIn";
import { TransactionState } from "./GlobalState";
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

      throw new Error("Invalid Transactions Configuration");
  }
  
  if(settings.maxGasFee < 0) settings.maxGasFee = 1;
  
  const result = new Array<TransactionRequestGroup>();
  const provider = new ethers.providers.JsonRpcProvider(node.rpcUrl);

  const totalMintCost = ethers.utils.parseEther(`${settings.pricePerUnit || 0}`).mul(settings.unitsPerTxn);
  
  const params = new Array<any>();
  params.push(settings.unitsPerTxn);

  settings.mintFunction.inputs.forEach((x,i) => {
    if(i>0) params.push(settings.functionParams?.get(x.name));
  })
  
  const data = mintContract.abi.encodeFunctionData(settings.mintFunction, params);
  const txnsPerWallet = settings.transactionsPerWallet || 1;
  const sig = window.sessionStorage.getItem(ROGUE_SESSION_SIGNATURE);
  const simpleCrypto = new SimpleCrypto(sig);

  for(let w=0; w<settings.selectedWallets.length; w++) {
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

export interface PendingTransactionGroup {
  wallet: IWalletRecord,
  transactions: Promise<TransactionResponse>[]
}

async function sendTransactions(groups: TransactionRequestGroup[], node:INodeRecord) : Promise<PendingTransactionGroup[]> {
  const provider = new ethers.providers.JsonRpcProvider(node.rpcUrl);
  const result = new Array<PendingTransactionGroup>();
  const sig = window.sessionStorage.getItem(ROGUE_SESSION_SIGNATURE);
  const simpleCrypto = new SimpleCrypto(sig);

  for(let g=0; g<groups.length; g++) {
    const responses = new Array<Promise<TransactionResponse>>();
    const signer = new ethers.Wallet(simpleCrypto.decrypt(groups[g].wallet.privateKey).toString());

    for(let i=0; i<groups[g].transactions.length; i++) {
      responses.push(provider.sendTransaction(await signer.signTransaction(groups[g].transactions[i])));
    }

    result.push({
      wallet: groups[g].wallet,
      transactions: responses
    })
  }

  return result;
}


export {getReadValue, prepareTransactions, sendTransactions, getWalletBalance};
