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

export interface IWallet {
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
  wallets: IWallet[]
  collections: ICollectionView[],
  addWallet: (wallet: IWallet) => void
  hideCollection: (address: string) => void
  updateWalletContents: () => void
  updateWalletBalances: () => void
}
