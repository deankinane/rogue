import IWalletRecord from "../entities/IWalletRecord";
import useLocalStorage from "./useLocalStorage";

export default function useWalletStorage(): [IWalletRecord[], (wallets: IWalletRecord[]) => void] {
  const ROGUE_STORAGE_WALLETS = 'ROGUE_STORAGE_WALLETS';

  const [wallets, setWallets] = useLocalStorage<IWalletRecord[]>(ROGUE_STORAGE_WALLETS);
  // function setWallets(wallets: IWalletRecord[]) {
  //   localStorage.setItem(ROGUE_STORAGE_WALLETS, JSON.stringify(wallets));
  // }
  // let wallets: IWalletRecord[] = [];

  // const walletStorageJson = localStorage.getItem(ROGUE_STORAGE_WALLETS);
  // if (walletStorageJson !== null) {
  //   wallets = JSON.parse(walletStorageJson);
  // }

  return [wallets || new Array<IWalletRecord>(), setWallets];
}
