import { loadWalletContents } from "../../entities/IcyApi";
import { LocalStore } from "../../entities/LocalStore"
import { getWalletBalance } from "../../entities/ProviderFunctions";
import { ICollectionView, INft, IWallet } from "./WalletInterface";
const ROGUE_STORAGE_WALLETS = 'ROGUE_STORAGE_WALLETS';
const ROGUE_STORAGE_COLLECTIONS = 'ROGUE_STORAGE_COLLECTIONS';
const ROGUE_STORAGE_HIDDENCOLLECTIONS = 'ROGUE_STORAGE_HIDDENCOLLECTIONS';
const WalletLocalStore = new LocalStore<IWallet[]>(ROGUE_STORAGE_WALLETS, [])
const CollectionLocalStore = new LocalStore<ICollectionView[]>(ROGUE_STORAGE_COLLECTIONS, [])
const HiddenCollectionLocalStore = new LocalStore<string[]>(ROGUE_STORAGE_HIDDENCOLLECTIONS, [])

function getWallets(): IWallet[] {
  return WalletLocalStore.getData()
}

function getCollections(): ICollectionView[] {
  return CollectionLocalStore.getData()
}

async function addWallet(Wallet:IWallet) {
  const updated = [...getWallets()]
  updated.push(Wallet)
  WalletLocalStore.setData(updated)
  await updateWalletContents()
}

function deleteWallet(wallet: IWallet): IWallet[] {
  const updated = [...getWallets()]
  const idx = updated.findIndex(w => w.publicKey === wallet.publicKey)
  updated.splice(idx, 1)
  WalletLocalStore.setData(updated)
  return updated
}

// function updateWallet(WalletIndex: number, Wallet: IWallet): IWallet[] {
//   const updated = [...getWallets()]
//   updated[WalletIndex] = Wallet
//   WalletLocalStore.setData(updated)
//   return updated
// }

function hideCollection(address: string) {
  const hiddenCols = [...HiddenCollectionLocalStore.getData()]
  hiddenCols.push(address)
  HiddenCollectionLocalStore.setData(hiddenCols)

  const storedWallets = [...getWallets()]
  storedWallets.forEach(w => {
    w.contents.forEach(nft => {
      if (nft.collection.address === address)
        nft.collection.hidden = true
    })
  })

  WalletLocalStore.setData(storedWallets)
  updateCollections(storedWallets)
}

async function updateWalletBalances() {
  const storedWallets = [...getWallets()]
  for(let i=0; i<storedWallets.length; i++) {
    storedWallets[i].balance = await getWalletBalance(storedWallets[i].publicKey);   
  }
  
  WalletLocalStore.setData(storedWallets)
}

async function updateWalletContents() {
  const updated = [...getWallets()]
  const hidden = [...HiddenCollectionLocalStore.getData()]
  
  for(let i=0; i<updated.length; i++) {
    updated[i].contents = await loadWalletContents(updated[i].publicKey);

    updated[i].contents.forEach(nft => {
      nft.collection.hidden = hidden.findIndex(h => nft.collection.address === h) > -1
    })
  }

  WalletLocalStore.setData(updated)
  updateCollections(updated)
}


function updateCollections(wallets: IWallet[]) {
  const collections = new Array<ICollectionView>()
  wallets.forEach(w => {
    w.contents.forEach(nft => {
      const idx = collections.findIndex(c => c.collection.address === nft.collection.address)
      if (idx < 0) {
        const tokens = new Array<INft>()
        tokens.push(nft)
        collections.push({
          collection: nft.collection,
          tokens: tokens
        })
      }
      else {
        collections[idx].tokens.push(nft)
      }
    });
  });
  CollectionLocalStore.setData(collections)
}

export  {getWallets, getCollections, addWallet, hideCollection, updateWalletBalances, updateWalletContents, deleteWallet}
