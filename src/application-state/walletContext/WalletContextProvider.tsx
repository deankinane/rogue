import React, { useState } from 'react'
import IPropsChildren from '../../common/IPropsChildren';
import { loadWalletContents } from '../../entities/IcyApi';
import { getWalletBalance } from '../../entities/ProviderFunctions';
import useLocalStorage from '../../hooks/useLocalStorage';
import { IWalletRecord, IWalletState, INft, WalletContext, ICollectionView } from './WalletContext'

function WalletContextProvider({children}:IPropsChildren) {
  const ROGUE_STORAGE_WALLETS = 'ROGUE_STORAGE_WALLETS';
  const ROGUE_STORAGE_COLLECTIONS = 'ROGUE_STORAGE_COLLECTIONS';
  const ROGUE_STORAGE_HIDDENCOLLECTIONS = 'ROGUE_STORAGE_HIDDENCOLLECTIONS';
  const [storedWallets, setStoredWallets] = useLocalStorage<IWalletRecord[]>(ROGUE_STORAGE_WALLETS, []);
  const [storedCollections, setStoredCollections] = useLocalStorage<ICollectionView[]>(ROGUE_STORAGE_COLLECTIONS, []);
  const [hiddenCollections, setHiddenCollections] = useLocalStorage<string[]>(ROGUE_STORAGE_HIDDENCOLLECTIONS, []);

  const [wallets, setWallets] = useState<IWalletRecord[]>(storedWallets)
  const [collections, setCollections] = useState<ICollectionView[]>(storedCollections)

  function addWallet(wallet: IWalletRecord) {
    const updated = [...storedWallets]
    updated.push(wallet)
    setStoredWallets(updated)
    setWallets(updated)
    updateWalletContents()
  }

  function hideCollection(address: string) {
    hiddenCollections.push(address);
    setHiddenCollections(hiddenCollections);
    storedWallets.forEach(w => {
      w.contents.forEach(nft => {
        nft.collection.hidden = hiddenCollections.findIndex(c => nft.collection.address === c) > -1
      })
    })
    setStoredWallets(storedWallets)
    setWallets(storedWallets)
    updateCollections(storedWallets)
  }

  async function updateWalletContents() {
    const updated = [...storedWallets]
    for(let i=0; i<updated.length; i++) {
      updated[i].contents = await loadWalletContents(updated[i].publicKey);
    }

    setStoredWallets(updated)
    setWallets(ws => (updated))
    updateCollections(updated)
  }

  function updateCollections(wallets: IWalletRecord[]) {
    const collections = new Array<ICollectionView>()
    wallets.forEach(w => {
      w.contents.forEach(nft => {
        nft.collection.hidden = hiddenCollections.findIndex(c => nft.collection.address === c) > -1
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
    
    collections.sort((x,y) => {
      const textA = x.collection.name.toUpperCase();
      const textB = y.collection.name.toUpperCase();
      return (textA < textB) ? -1 : (textA > textB) ? 1 : 0;
    })

    setStoredCollections(collections)
    setCollections(cs => (collections))
  }
  async function updateWalletBalances() {
    const updated = [...storedWallets]
    for(let i=0; i<updated.length; i++) {
      updated[i].balance = await getWalletBalance(updated[i].publicKey);      
    }
    
    setStoredWallets(updated)
    setWallets(ws => (updated))
  }


  const walletState: IWalletState = {
    wallets: wallets,
    collections: collections,
    addWallet: addWallet,
    hideCollection: hideCollection,
    updateWalletContents: updateWalletContents,
    updateWalletBalances: updateWalletBalances
  }

  return (
    <WalletContext.Provider value={walletState}>{children}</WalletContext.Provider>
  )
}

export default WalletContextProvider
