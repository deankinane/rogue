import React, { useContext, useEffect, useState } from 'react'
import { Button, Col, Container, Row, Spinner } from 'react-bootstrap';
import { UserContext } from '../../application-state/userContext/UserContext';
import WalletConnectionWidget from '../../components/walletConnectionWidget/WalletConnectionWidget';
import { purchaseLicence } from '../../entities/LicenceFunctions';
import useOnMount from '../../hooks/useOnMount';

function HomePage() {
  const {user} = useContext(UserContext)
  const [loading, setLoading] = useState(false);
  const [showBuyButton, setShowBuyButton] = useState(false);

  useOnMount(async () => {
    document.title = 'ROGUE - Mint NFTs Fast'
  })
  
  useEffect(() => {
    setShowBuyButton(user.connected && !user.licenced);
  },[user])

  async function buyLicence() {
    setLoading(true);
    const result = await purchaseLicence();
    setShowBuyButton(!result);
    setLoading(false);
  }

  return (
    <Container>
      <Row className='m-4'>
        <Col>
          <div className="d-flex">
            <img src="./img/rogue_logo.svg" alt="ROGUE Logo - Mint NFTs Fast" />
            <div className="flex-grow-1 justify-content-end">
              <WalletConnectionWidget />
            </div>
          </div>
        </Col>
      </Row>
      <Row className='m-4'>
        <Col>
          <p>1. Connect your wallet</p>
          <p>2. Sign transaction to log in when prompted</p>
          <p>3. Add your node in the Settings</p>
          <p>4. Add your wallets</p>
          <p>5. Mint!</p>
        </Col>
      </Row>
      <Row className='m-4'>
        <Col>
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
        </Col>
      </Row>

     
    </Container>
  )
}

export default HomePage
