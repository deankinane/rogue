import { useRef } from "react";
import { loadWalletContents } from "../entities/IcyApi";
import IWalletRecord from "../entities/IWalletRecord";
import useHiddenCollections from "./useHiddenCollections";
import useLocalStorage from "./useLocalStorage";

export default function useWalletStorage(): [IWalletRecord[], (wallets: IWalletRecord[]) => void, () => void, () => void] {
  const ROGUE_STORAGE_WALLETS = 'ROGUE_STORAGE_WALLETS';
  const initialLoad = useRef(true);

  const [wallets, setWallets] = useLocalStorage<IWalletRecord[]>(ROGUE_STORAGE_WALLETS);
  const [collections] = useHiddenCollections();
  
  const updateWalletContents = async () => {
    if(!wallets) return;
    
    for(let i=0; i<wallets.length; i++) {
      wallets[i].contents = await loadWalletContents(wallets[i].publicKey);      
      await new Promise(r => setTimeout(r, 200));
    }

    setWallets(wallets);
  }

  function filterHiddenCollections() {
    if(!wallets) return;
    
    for(let i=0; i<wallets.length; i++) {
      wallets[i].contents.forEach(nft => {
        nft.collection.hidden = collections.findIndex(c => nft.collection.address === c) > -1
      })
    }
    
    setWallets(wallets)
  }

  if (initialLoad.current) {
    initialLoad.current = false;
    updateWalletContents().then(() => filterHiddenCollections())
  }

  return [wallets || new Array<IWalletRecord>(), setWallets, updateWalletContents, filterHiddenCollections];
}
