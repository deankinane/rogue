import { createContext } from "react"
import IWalletRecord from "../../entities/IWalletRecord"

export interface IWalletState {
  wallets: IWalletRecord[]
  addWallet: (wallet: IWalletRecord) => void
  hideCollection: (address: string) => void
  updateWalletContents: () => void
  updateWalletBalances: () => void
}

export const WalletContext = createContext<IWalletState>({
  wallets: [],
  addWallet: (wallet: IWalletRecord) => {},
  hideCollection: (address: string) => {},
  updateWalletContents: () => {},
  updateWalletBalances: () => {}
})
