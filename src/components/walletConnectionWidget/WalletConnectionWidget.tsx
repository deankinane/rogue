import { useEffect } from "react";
import { Button, InputGroup } from "react-bootstrap";
import { GearFill, Wallet, WalletFill } from "react-bootstrap-icons";
import useSignedIn from "../../hooks/useSignedIn";
import useWalletConnected from "../../hooks/useWalletConnected";

export default function WalletConnectionWidget() {
  
  const [connectedWallet, connectWallet] = useWalletConnected();
  const [signedIn, signature, signIn] = useSignedIn();

  useEffect(() => {
    if(connectedWallet.connected && !signedIn) {
      signIn();
    }
  },[connectedWallet, signedIn])

  async function connectButtonClick(event: React.MouseEvent<HTMLButtonElement>) {
    connectWallet();
  }

  return (
    <div style={{"width":"120px"}} className='float-end'>
      {
        connectedWallet.connected
        ? (
          <InputGroup>
          <InputGroup.Text><WalletFill/></InputGroup.Text>
          <InputGroup.Text>{connectedWallet.address?.substring(0,6)}...</InputGroup.Text>
        </InputGroup>
        )
        : (
          <Button variant="success" onClick={connectButtonClick}>Connect Wallet</Button>
        )
      }
    </div>
  );
}
