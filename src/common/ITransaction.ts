import { TransactionReceipt, TransactionRequest, TransactionResponse } from "@ethersproject/abstract-provider";
import { ethers } from "ethers";
import { IWallet } from "../application-state/walletStore/WalletInterface";

export enum TransactionStatus {
  pending = 1,
  complete = 2,
  failed = 3
}

export interface ITransaction {
  request: TransactionRequest
  promise?: Promise<TransactionResponse>
  response?: TransactionResponse
  receipt?: TransactionReceipt
  status?: TransactionStatus
}

export interface ITransactionGroup {
  wallet: IWallet
  signer: ethers.Wallet,
  transactions: ITransaction[]
}
