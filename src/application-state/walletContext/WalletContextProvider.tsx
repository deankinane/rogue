import React, { useEffect, useRef, useState } from 'react'
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
    storedWallets.push(wallet)
    setStoredWallets(storedWallets)
    setWallets(storedWallets)
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
  }

  async function updateWalletContents() {
    const collections = new Array<ICollectionView>()

    for(let i=0; i<storedWallets.length; i++) {
      storedWallets[i].contents = await loadWalletContents(storedWallets[i].publicKey);
      storedWallets[i].contents.forEach(nft => {
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
    }

    collections.sort((x,y) => {
      const textA = x.collection.name.toUpperCase();
      const textB = y.collection.name.toUpperCase();
      return (textA < textB) ? -1 : (textA > textB) ? 1 : 0;
    })

    setStoredCollections(collections)
    setCollections(cs => (collections))
    setStoredWallets(storedWallets)
    setWallets(ws => (storedWallets))
  }

  async function updateWalletBalances() {
    
    for(let i=0; i<storedWallets.length; i++) {
      storedWallets[i].balance = await getWalletBalance(wallets[i].publicKey);      
    }
    
    setStoredWallets(storedWallets)
    setWallets(ws => (storedWallets))
  }


  const walletState: IWalletState = {
    wallets: wallets || [],
    collections: collections || [],
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
