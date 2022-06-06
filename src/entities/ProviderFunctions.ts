import { TransactionRequest, TransactionResponse } from "@ethersproject/providers";
import { Contract, ethers } from "ethers";
import { TransactionState } from "./GlobalState";
import IWalletRecord from "./IWalletRecord";
import MintContract from "./MintContract";

// const rpc: string = 'wss://frosty-floral-snowflake.quiknode.pro/249e9db0c811c7e63ee4c5d2f2d4065898c7a9af/';
const rpc: string = 'wss://damp-frosty-sky.rinkeby.quiknode.pro/df6200ad29cf299fe6c18eb67a2eca5ebd4f3abf/';

async function getReadValue(mintContract : MintContract, func:string) : Promise<any> {
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const signer = provider.getSigner();
  
  if (!mintContract.abi) throw new Error("Error loading contract");

  const contract = new Contract(mintContract.address, mintContract.abi, signer)
  return await contract.functions[func]();
}

export interface TransactionRequestGroup {
  wallet: IWalletRecord,
  transactions: TransactionRequest[]
}

async function prepareTransactions (mintContract: MintContract, settings: TransactionState) : Promise<TransactionRequestGroup[]> {
  if (!(settings.mintFunction && settings.contractAddress
    && settings.functionParams && settings.maxGasFee && settings.selectedWallets
    && settings.transactionsPerWallet &&  mintContract.abi)) {

      throw new Error("Invalid Transactions Configuration");
  }
  if(settings.maxGasFee < 0) settings.maxGasFee = 1;
  
  console.log(settings.selectedWallets)
  const result = new Array<TransactionRequestGroup>();

  const provider = new ethers.providers.WebSocketProvider(rpc);

  const params = settings.mintFunction.inputs.map(i => settings.functionParams?.get(i.name));
  const data = mintContract.abi.encodeFunctionData(settings.mintFunction, params);
  const txnsPerWallet = settings.transactionsPerWallet || 1;

  for(let w=0; w<settings.selectedWallets.length; w++) {
    const transactions = new Array<TransactionRequest>();
  
    const wallet = new ethers.Wallet(settings.selectedWallets[w].privateKey, provider);
    const base_nonce = await provider.getTransactionCount(wallet.address);

    const gasLimit = await wallet.estimateGas({
      to: settings.contractAddress, 
      data: data,
      value: ethers.utils.parseEther(`${settings.totalCost}`)
    });
  
    for(let i=0; i<txnsPerWallet; i++) {
      transactions.push({
        to: settings.contractAddress,
        value: ethers.utils.parseEther(`${settings.totalCost}`),
        nonce: base_nonce + i,
        data: data,
        chainId: window.ethereum.networkVersion,
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

async function sendTransactions(groups: TransactionRequestGroup[]) : Promise<PendingTransactionGroup[]> {
  const provider = new ethers.providers.WebSocketProvider(rpc);
  const result = new Array<PendingTransactionGroup>();

  for(let g=0; g<groups.length; g++) {
    const responses = new Array<Promise<TransactionResponse>>();
    const signer = new ethers.Wallet(groups[g].wallet.privateKey);

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


export {getReadValue, prepareTransactions, sendTransactions};
