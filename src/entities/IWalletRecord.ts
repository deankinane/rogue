import { BigNumber } from "ethers"

export default interface IWalletRecord {
  name: string
  privateKey: string
  publicKey: string,
  balance: BigNumber
}
