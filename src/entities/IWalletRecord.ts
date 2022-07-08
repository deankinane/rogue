export interface CollectionDetails {
  address: string
  name: string
  slug: string
  logo: string
  hidden: boolean
}

export interface NFT {
  collection: CollectionDetails
  name: string
  image: string
  tokenId: string
}

export default interface IWalletRecord {
  name: string
  privateKey: string
  publicKey: string,
  balance: string,
  contents: NFT[]
}
