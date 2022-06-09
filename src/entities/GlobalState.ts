import { FunctionFragment } from "ethers/lib/utils";
import IWalletRecord from "./IWalletRecord";

export interface TransactionState {
  contractAddress: string
  mintFunction?: FunctionFragment
  functionParams:Map<string, any>
  selectedWallets:IWalletRecord[]
  unitsPerTxn: number
  pricePerUnit: number
  transactionsPerWallet: number,
  maxGasFee: number
}

export interface TransactionStateUpdate {
  contractAddress?: string
  mintFunction?: FunctionFragment
  functionParams?:Map<string, any>
  selectedWallets?:IWalletRecord[]
  unitsPerTxn?: number
  pricePerUnit?: number
  transactionsPerWallet?: number,
  maxGasFee?: number
}

export const defaultTransactionState = {
  unitsPerTxn: 1,
    transactionsPerWallet: 1,
    pricePerUnit: 0,
    selectedWallets: new Array<IWalletRecord>(),
    contractAddress: '',
    functionParams: new Map<string,any>(),
    maxGasFee: 0
}
