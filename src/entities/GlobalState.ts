import { FunctionFragment } from "ethers/lib/utils";
import IWalletRecord from "./IWalletRecord";

export interface TransactionState {
  contractAddress?: string
  mintFunction?: FunctionFragment
  functionParams?:Map<string, any>
  selectedWallets?:IWalletRecord[]
  totalCost?: number
  transactionsPerWallet?: number,
  maxGasFee?: number
}

