import { ethers } from "ethers";
import { useEffect, useState } from "react";
import useLocalStorage from "./useLocalStorage";

export interface ConnectedWalletInfo {
  connected: boolean
  chainId?: number
  address?: string
}

export default function useWalletConnected(): [ConnectedWalletInfo, () => void] {

  const [walletInfo, setWalletInfo] = useState<ConnectedWalletInfo>({
    connected: false,
    chainId: undefined,
    address: undefined
  });

  function connectWallet() {
    const provider = new ethers.providers.Web3Provider(window.ethereum);

    const info: ConnectedWalletInfo = {
        connected: false,
        chainId: undefined,
        address: undefined
      };
      
      provider.send("eth_requestAccounts", [])
        .then(accounts => {
          if (accounts && accounts.length >= 1) {
            info.address = accounts[0];
            info.connected = true;
            setWalletInfo(info);
          }
        });
  }

  useEffect(() => {
    
    const checkIfConnected = async () => {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const accounts = await provider.send("eth_accounts", []);
      if (accounts && accounts.length >= 1) {
        const info: ConnectedWalletInfo = {
          connected: true,
          chainId: 1,
          address: accounts[0]
        };

        setWalletInfo(info);
      }
      else {
        const info: ConnectedWalletInfo = {
          connected: false,
          chainId: 1,
          address: undefined
        };

        setWalletInfo(info);
      }
    }
  
    checkIfConnected();

  }, [])
  
  return [walletInfo, connectWallet];
}
