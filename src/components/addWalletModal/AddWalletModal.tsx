import { ethers } from 'ethers';
import React, { FormEvent, useContext, useState } from 'react'
import { Button, Form, Modal, ModalProps, Spinner } from 'react-bootstrap'
import { getWalletBalance } from '../../entities/ProviderFunctions';
import SimpleCrypto from 'simple-crypto-js';
import { IWalletRecord, WalletContext } from '../../application-state/walletContext/WalletContext';
import { UserContext } from '../../application-state/userContext/UserContext';

interface AddWalletModalProps extends ModalProps {
  callback: (wallet?: IWalletRecord ) => void
}

function AddWalletModal({callback, ...props}: AddWalletModalProps) {
  const {wallets} = useContext(WalletContext)
  const [walletName, setWalletName] = useState("");
  const [privateKey, setPrivateKey] = useState("");
  const [working, setWorking] = useState(false);
  const {user} = useContext(UserContext)

  async function onAddButtonClicked(e: FormEvent) {
    e.preventDefault();

    wallets.forEach(w => {
      if(w.name === walletName){
        // TODO show error message
        
        return;
      }
    });

    setWorking(true);
    const etherWallet = new ethers.Wallet(privateKey);

    const simpleCrypto = new SimpleCrypto(user.address); 
    const encrypted = simpleCrypto.encrypt(privateKey);

    const newWallet: IWalletRecord = {
      name: walletName,
      privateKey: encrypted,
      publicKey: etherWallet.address,
      balance: "0",
      contents: []
    };

    newWallet.balance = await getWalletBalance(etherWallet.address);

    callback(newWallet);
    setWorking(false);
  }

  return (
    <Modal
      {...props}
      centered
      backdrop='static'
      keyboard={false}
      onHide={callback}
    >
      <Modal.Header closeButton>
        <Modal.Title id="contained-modal-title-vcenter">
          Add New Wallet
        </Modal.Title>
      </Modal.Header>
      <Form onSubmit={onAddButtonClicked}>
      <Modal.Body>
        
          <Form.Group className="mb-3">
            <Form.Label>Wallet Name</Form.Label>
            <Form.Control maxLength={12} required onChange={e => setWalletName(e.currentTarget.value)}/>
            <Form.Text className="text-muted">
              Enter a unique name for this wallet (max 12 characters)
            </Form.Text>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Private Key</Form.Label>
            <Form.Control required onChange={e => setPrivateKey(e.currentTarget.value)}/>
            <Form.Text className="text-muted">
              Private keys will be encrypted and only stored on your local device 
            </Form.Text>
          </Form.Group>
        
      </Modal.Body>
      <Modal.Footer>
        <Button 
          type='submit' 
          variant='success' 
          style={{'width': '103px'}}
          disabled={working}>
            {working ? <Spinner size='sm' animation="border" /> : 'Save Wallet'}
          </Button>
      </Modal.Footer>
      </Form>
    </Modal>
  )
}

export default AddWalletModal
