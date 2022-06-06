import { ethers } from 'ethers';
import React, { ChangeEvent, useState } from 'react'
import { Button, Form, Modal, ModalProps } from 'react-bootstrap'
import IWalletRecord from '../../entities/IWalletRecord'
import useWalletStorage from '../../hooks/useWalletStorage';


interface AddWalletModalProps extends ModalProps {
  callback: (wallet?: IWalletRecord ) => void
}

function AddWalletModal({callback, ...props}: AddWalletModalProps) {
  const [wallets, setWallets] = useWalletStorage();
  const [walletName, setWalletName] = useState("");
  const [privateKey, setPrivateKey] = useState("");

  function onAddButtonClicked() {
    wallets.forEach(w => {
      if(w.name === walletName){
        // TODO show error message
        return;
      }
    });

    const etherWallet = new ethers.Wallet(privateKey);

    const newWallet: IWalletRecord = {
      name: walletName,
      privateKey: privateKey,
      publicKey: etherWallet.address
    };

    wallets.push(newWallet);
    setWallets(wallets);
    callback(newWallet);
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
            <Form.Control required onChange={e => setWalletName(e.currentTarget.value)}/>
            <Form.Text className="text-muted">
              Enter a unique name for this wallet
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
        <Button type='submit' variant='success'>Save Wallet</Button>
      </Modal.Footer>
      </Form>
    </Modal>
  )
}

export default AddWalletModal
