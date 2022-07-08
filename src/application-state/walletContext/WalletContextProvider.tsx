import React, { useEffect, useState } from 'react'
import IPropsChildren from '../../common/IPropsChildren';
import { loadWalletContents } from '../../entities/IcyApi';
import IWalletRecord, { NFT } from '../../entities/IWalletRecord';
import { getWalletBalance } from '../../entities/ProviderFunctions';
import useLocalStorage from '../../hooks/useLocalStorage';
import { IWalletState, WalletContext } from './WalletContext'

function WalletContextProvider({children}:IPropsChildren) {
  const ROGUE_STORAGE_WALLETS = 'ROGUE_STORAGE_WALLETS';
  const ROGUE_STORAGE_HIDDENCOLLECTIONS = 'ROGUE_STORAGE_HIDDENCOLLECTIONS';
  const [storedWallets, setStoredWallets] = useLocalStorage<IWalletRecord[]>(ROGUE_STORAGE_WALLETS, []);
  const [hiddenCollections, setHiddenCollections] = useLocalStorage<string[]>(ROGUE_STORAGE_HIDDENCOLLECTIONS, []);
  

  const [wallets, setWallets] = useState<IWalletRecord[]>([])
  
  useEffect(() => {
    setWallets(storedWallets || [])
  },[])

  function addWallet(wallet: IWalletRecord) {
    setWallets(ws => {
      ws.push(wallet)
      setStoredWallets(ws)
      return ws
    })
  }

  function hideCollection(address: string) {
    hiddenCollections.push(address);
    setHiddenCollections(hiddenCollections);

    setWallets(ws => {
      ws.forEach(w => {
        w.contents.forEach(nft => {
          nft.collection.hidden = hiddenCollections.findIndex(c => nft.collection.address === c) > -1
        })
      })

      setStoredWallets(ws)
      return ws
    })
  }

  async function updateWalletContents() {
    const contents = new Array<NFT[]>()
    
    for(let i=0; i<wallets.length; i++) {
      contents[i] = await loadWalletContents(wallets[i].publicKey);      
    }

    setWallets(ws => {
      for(let i=0; i<ws.length; i++) {
        ws[i].contents = contents[i]
      }

      setStoredWallets(ws)
      return ws
    })  
  }

  async function updateWalletBalances() {
    const balances = new Array<string>();

    for(let i=0; i<wallets.length; i++) {
      balances[i] = await getWalletBalance(wallets[i].publicKey);      
    }
    
    setWallets(ws => {
      for(let i=0; i<ws.length; i++) {
        ws[i].balance = balances[i]
      }

      setStoredWallets(ws)
      return ws
    })  
  }

  const walletState: IWalletState = {
    wallets: wallets || [],
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
