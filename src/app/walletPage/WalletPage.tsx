import React, { useEffect, useState } from 'react'
import { Row, Col, Card, Button } from 'react-bootstrap'
import { PlusCircleFill, Wallet } from 'react-bootstrap-icons';
import { useNavigate } from 'react-router-dom';
import AddWalletModal from '../../components/addWalletModal/AddWalletModal';
import WalletRecord from '../../components/walletRecord/WalletRecord'
import IWalletRecord from '../../entities/IWalletRecord';
import { getWalletBalance } from '../../entities/ProviderFunctions';
import useIsLicensed from '../../hooks/useIsLicensed';
import useNodeStorage from '../../hooks/useNodeStorage';
import useOnMount from '../../hooks/useOnMount';
import useSignedIn from '../../hooks/useSignedIn';
import useWalletStorage from '../../hooks/useWalletStorage';
import './WalletPage.css';

function WalletPage() {
  const [addWalletModalVisible, setAddWalletModalVisible] = useState(false);
  const [wallets, setWallets] = useWalletStorage();
  const [node] =  useNodeStorage();
  const licensed = useIsLicensed();
  const navigate = useNavigate();
  const [render, setRender] = useState(false);
  const [signedIn] = useSignedIn();

  const [walletList, setWalletList] = useState(new Array<IWalletRecord>());
  
  useEffect(() => {
    if (!licensed.checked) return;
    if (!licensed.licensed || !signedIn) navigate('/');
    setRender(true);
  },[licensed, signedIn])
  
  useOnMount(async () => {
    document.title = 'ROGUE - Mint NFTs Fast'
    if(node) {
      for(let i=0; i<wallets.length; i++) {
        wallets[i].balance = await getWalletBalance(wallets[i].publicKey, node)
      }
      setWallets(wallets);
      setWalletList(wallets);
    }
  })
  
  function onAddWalletClick() {
    setAddWalletModalVisible(true);
  }

  function onAddWalletCallback(wallet?: IWalletRecord) {
    setAddWalletModalVisible(false);
    if(wallet){
      walletList.push(wallet);
      setWallets(walletList);
    }
  }
  function onDeleteWallet(wallet: IWalletRecord) {

    setWalletList(walletList.filter(x => x.name !== wallet.name))
    setWallets(walletList.filter(x => x.name !== wallet.name));
  }

  return (
    !render ? <></> : 
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
                  <Col xs={7} lg={5}>
                    <p className='table-header__p'>Public Address</p>
                  </Col>
                  <Col>
                    <p className='table-header__p'>Balance</p>
                  </Col>
                </Row>
              </div>
              {walletList.map((x,i) => <WalletRecord key={i} wallet={x} onDeleteWallet={onDeleteWallet} />)}
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
