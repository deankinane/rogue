import { ethers } from "ethers";
import { useEffect, useState } from "react";

export const ROGUE_SESSION_SIGNATURE = 'ROGUE_SESSION_SIGNATURE';

export default function useSignedIn() : [boolean, string, () => void] {
  
  const [signedIn, setSignedIn] = useState(false);
  const [signature, setSignature] = useState('');
  const [awaitingSignature, setAwaitingSignature] = useState(false);
  
  useEffect(() => {
    const sig = window.sessionStorage.getItem(ROGUE_SESSION_SIGNATURE);
    if (sig) {
      setSignedIn(true);
      setSignature(sig);
    }
  },[])
  
  async function signIn() {

    if(awaitingSignature) return;

    setAwaitingSignature(true);
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    try {
      const sig = await signer.signMessage("Rogue - Sign In");
      setSignedIn(true);
      setSignature(sig);
      window.sessionStorage.setItem(ROGUE_SESSION_SIGNATURE, sig);
    } catch (error) {
      setSignedIn(false);
      setSignature('');
    }

    setAwaitingSignature(false);
  }

  return [signedIn, signature, signIn];
}
