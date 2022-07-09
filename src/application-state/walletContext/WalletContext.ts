import { createContext } from "react"
export interface ICollectionDetails {
  address: string
  name: string
  slug: string
  logo: string
  hidden: boolean
}

export interface INft {
  collection: ICollectionDetails
  name: string
  image: string
  tokenId: string
}

export interface IWalletRecord {
  name: string
  privateKey: string
  publicKey: string,
  balance: string,
  contents: INft[]
}

export interface ICollectionView {
  collection: ICollectionDetails
  tokens: INft[]
}

export interface IWalletState {
  wallets: IWalletRecord[]
  collections: ICollectionView[],
  addWallet: (wallet: IWalletRecord) => void
  hideCollection: (address: string) => void
  updateWalletContents: () => void
  updateWalletBalances: () => void
}

export const WalletContext = createContext<IWalletState>({
  wallets: [],
  collections: [],
  addWallet: (wallet: IWalletRecord) => {},
  hideCollection: (address: string) => {},
  updateWalletContents: () => {},
  updateWalletBalances: () => {}
})
