import { FunctionFragment } from "ethers/lib/utils";
import { IWallet } from "../application-state/walletStore/WalletInterface";
import { ParamTypes } from "./constants";

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
  selectedWallets:IWallet[]
  unitsPerTxn: number
  pricePerUnit: number
  totalCost: number
  transactionsPerWallet: number,
  maxGasFee: number,
  maxPriorityFee: number,
  maxSupply: number,
  customParams: boolean
}

export interface TransactionStateUpdate {
  contractAddress?: string
  mintFunction?: FunctionFragment
  functionParams?:Array<CustomParam>
  selectedWallets?:IWallet[]
  pricePerUnit?: number
  unitsPerTxn?: number
  totalCost?: number
  transactionsPerWallet?: number,
  maxGasFee?: number,
  maxPriorityFee?: number,
  maxSupply?: number,
  customParams?: boolean
}

export const defaultTransactionState: TransactionState = {
  unitsPerTxn: 1,
  mintFunction: FunctionFragment.from('temp() view returns (uint256)'),
  transactionsPerWallet: 1,
  pricePerUnit:0,
  totalCost: 0,
  selectedWallets: new Array<IWallet>(),
  contractAddress: '',
  functionParams: new Array<CustomParam>(),
  maxGasFee: 0,
  maxPriorityFee: 0,
  maxSupply: 0,
  customParams: false
}
