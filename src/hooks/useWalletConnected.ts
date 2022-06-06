import { ethers } from "ethers";
import { useEffect, useState } from "react";

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

  function connectWallet(prompt: boolean = true) {
    const chainId = window.ethereum.networkVersion;
    const address = window.ethereum.selectedAddress;
    

    if (address !== null) {
      setWalletInfo({
        connected: true,
        chainId: chainId,
        address: address
      });
      return;
    }

    if (prompt) {
      const info: ConnectedWalletInfo = {
        connected: false,
        chainId: chainId,
        address: undefined
      };
  
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      provider.send("eth_requestAccounts", [])
        .then(accounts => {
          if (accounts && accounts.length >= 1) {
            info.address = accounts[0];
            info.connected = true;
            setWalletInfo(info);
          }
        });
    } 
  }

  useEffect(() => {
    connectWallet();
  }, [])
  
  return [walletInfo, connectWallet];
}
