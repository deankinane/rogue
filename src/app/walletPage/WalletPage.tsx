import React, { useState } from 'react'
import { Row, Col, Card, Button } from 'react-bootstrap'
import { PlusCircleFill, Wallet } from 'react-bootstrap-icons';
import AddWalletModal from '../../components/addWalletModal/AddWalletModal';
import WalletRecord from '../../components/walletRecord/WalletRecord'
import IWalletRecord from '../../entities/IWalletRecord';
import useWalletStorage from '../../hooks/useWalletStorage';
import './WalletPage.css';

function WalletPage() {
  const [addWalletModalVisible, setAddWalletModalVisible] = useState(false);
  const [wallets, setWallets] = useWalletStorage();

  function onAddWalletClick() {
    setAddWalletModalVisible(true);
  }

  function onAddWalletCallback(wallet?: IWalletRecord) {
    setAddWalletModalVisible(false);
    if(wallet){
      wallets.push(wallet);
      setWallets(wallets);
    }
  }

  return (
    <>
      <Row className='mb-3'>
        <Col className='d-flex align-items-center'>
          <h5 className='fw-bold mb-0'><Wallet className='me-3'/>Manage Wallets</h5>
        </Col>
        <Col>
        <Button 
                variant='info' 
                className='float-end'
                onClick={onAddWalletClick}>
                  <PlusCircleFill className='me-2'/> Add Wallet
              </Button>
        </Col>
      </Row>
      <Row>
        <Col>
          <Card>
            <Card.Body>
              <div className='mb-3 table-header'>
                <Row >
                  <Col xs={3}>
                    <p className='table-header__p'>Wallet Name</p>
                  </Col>
                  <Col xs={9}>
                    <p className='table-header__p'>Public Address</p>
                  </Col>
                </Row>
              </div>
              {wallets.map((x,i) => <WalletRecord key={i} wallet={x} />)}
            </Card.Body>
            
          </Card>
        </Col>
      </Row>
      <AddWalletModal 
        show={addWalletModalVisible} 
        callback={onAddWalletCallback}  
      />
    </>
    
  )
}

export default WalletPage
