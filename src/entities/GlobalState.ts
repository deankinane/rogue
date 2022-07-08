import { FunctionFragment } from "ethers/lib/utils";
import { ParamTypes } from "./constants";
import IWalletRecord from "./IWalletRecord";

export interface CustomParam {
  name: string
  type: ParamTypes,
  isArray: boolean,
  value: string,
  autoWalletAddress: boolean
  isAmountField: boolean
}

export interface TransactionState {
  contractAddress: string
  mintFunction: FunctionFragment
  functionParams:Array<CustomParam>
  selectedWallets:IWalletRecord[]
  unitsPerTxn: number
  pricePerUnit: number
  totalCost: number
  transactionsPerWallet: number,
  maxGasFee: number,
  maxSupply: number,
  customParams: boolean
}

export interface TransactionStateUpdate {
  contractAddress?: string
  mintFunction?: FunctionFragment
  functionParams?:Array<CustomParam>
  selectedWallets?:IWalletRecord[]
  pricePerUnit?: number
  unitsPerTxn?: number
  totalCost?: number
  transactionsPerWallet?: number,
  maxGasFee?: number,
  maxSupply?: number,
  customParams?: boolean
}

export const defaultTransactionState = {
  unitsPerTxn: 1,
  mintFunction: FunctionFragment.from('temp() view returns (uint256)'),
  transactionsPerWallet: 1,
  pricePerUnit:0,
  totalCost: 0,
  selectedWallets: new Array<IWalletRecord>(),
  contractAddress: '',
  functionParams: new Array<CustomParam>(),
  maxGasFee: 0,
  maxSupply: 0,
  customParams: false
}
