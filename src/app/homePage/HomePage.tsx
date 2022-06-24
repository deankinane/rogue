import React, { useEffect, useState } from 'react'
import { Button, Spinner } from 'react-bootstrap';
import { purchaseLicence } from '../../entities/LicenceFunctions';
import useIsLicensed from '../../hooks/useIsLicensed';
import useOnMount from '../../hooks/useOnMount';
import useWalletConnected from '../../hooks/useWalletConnected'

function HomePage() {
  const [walletInfo] = useWalletConnected();
  const licensed = useIsLicensed();
  const [loading, setLoading] = useState(false);
  const [showBuyButton, setShowBuyButton] = useState(false);

  useOnMount(async () => {
    document.title = 'ROGUE - Mint NFTs Fast'
  })
  
  useEffect(() => {
    setShowBuyButton(walletInfo.connected && !licensed.licensed);
  },[walletInfo, licensed])

  async function buyLicence() {
    setLoading(true);
    const result = await purchaseLicence();
    setShowBuyButton(!result);
    setLoading(false);
  }
  return (
    <div>

      <p>1. Connect your wallet</p>
      <p>2. Sign transaction to log in when prompted</p>
      <p>3. Add your node in the Settings</p>
      <p>4. Add your wallets</p>
      <p>5. Mint!</p>

      {
        showBuyButton ?
        <Button 
          style={{'width':'164px'}} 
          className="mb-3" 
          variant="info" 
          disabled={loading}
          onClick={buyLicence}
          >{loading ? <Spinner size='sm' animation="border" /> : 'Purchase Licence'}</Button>
        :<></>
      }      
    </div>
  )
}

export default HomePage
