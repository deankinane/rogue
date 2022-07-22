import create from 'zustand'
import { IWallet, IWalletState } from './WalletInterface'
import { addWallet, deleteWallet, getCollections, getWallets, hideCollection, updateWalletBalances, updateWalletContents } from './WalletStoreLocal'


export const useWalletStore = create<IWalletState>()(
  (set) => ({
    wallets: getWallets(),
    collections: getCollections(),
    async addWallet(wallet: IWallet) {
      await addWallet(wallet)
      set((state) => ({wallets: getWallets(), collections: getCollections()}))
    },
    async deleteWallet(wallet: IWallet) {
      deleteWallet(wallet)
      set((state) => ({wallets: getWallets(), collections: getCollections()}))
    },
    hideCollection(address: string) {
      hideCollection(address)
      set((state) => ({wallets: getWallets(), collections: getCollections()}))
    },
    async updateWalletBalances() {
      await updateWalletBalances()
      set((state) => ({wallets: getWallets()}))
    },
    async updateWalletContents() {
      await updateWalletContents()
      set((state) => ({wallets: getWallets(), collections: getCollections()}))
    },
  })
)
