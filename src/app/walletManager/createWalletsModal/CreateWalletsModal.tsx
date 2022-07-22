import { ethers } from 'ethers';
import React, { ChangeEvent, FormEvent, useContext, useState } from 'react'
import { ModalProps, Modal, Form, Button, Spinner, InputGroup, Col, Row } from 'react-bootstrap'
import SimpleCrypto from 'simple-crypto-js';
import { UserContext } from '../../../application-state/userContext/UserContext';
import { IWallet } from '../../../application-state/walletStore/WalletInterface';
import { useWalletStore } from '../../../application-state/walletStore/WalletStore';
import { disperseEth } from '../../../entities/ProviderFunctions';
import useToast from '../../../hooks/useToast';

interface CreateWalletsModalProps extends ModalProps {
  close: () => void
}

function CreateWalletsModal({close, ...props}:CreateWalletsModalProps) {
  const {wallets, addWallet} = useWalletStore()
  const [amount, _setAmount] = useState(1)
  const [ether, _setEther] = useState(0)
  const [working, setWorking] = useState(false);
  const {user} = useContext(UserContext)
  const sendToast = useToast()

  function setAmount(e: ChangeEvent<HTMLInputElement>) {
    _setAmount(parseInt(e.currentTarget.value))
  }

  function setEther(e: ChangeEvent<HTMLInputElement>) {
    _setEther(parseFloat(e.currentTarget.value))
  }

  async function onCreateButtonClicked(e: FormEvent) {
    e.preventDefault()

    setWorking(w => true)
    const initialCount = wallets.length;

    const newWallets = new Array<IWallet>()
    const simpleCrypto = new SimpleCrypto(user.address); 

    for(let i=1; i<=amount; i++) {
      const nw = ethers.Wallet.createRandom()
      newWallets.push({
        name: nw.address.substring(0,6),
        privateKey: simpleCrypto.encrypt(nw.privateKey),
        publicKey: nw.address,
        balance: "0",
        contents: []
      })
    }

    if (ether > 0) {
      const total = parseFloat((amount*ether).toFixed(3))
      const wallets = newWallets.map(x => x.publicKey)

      const rec = await disperseEth(wallets, total)
      if (rec) {
        newWallets.forEach(w => w.balance = ether.toFixed(3))
      }
      else {
        sendToast('Transaction Failed', 'Failed to disperse ETH, wallets have been created anyway', 'error')
      }
    }

    newWallets.forEach(w => addWallet(w))

    setWorking(false)
    close()
  }

  return (
    <Modal
      {...props}
      centered
      backdrop='static'
      keyboard={false}
      onHide={close}
    >
      <Modal.Header closeButton>
        <Modal.Title id="contained-modal-title-vcenter">
          Create Wallets
        </Modal.Title>
      </Modal.Header>
      <Form onSubmit={onCreateButtonClicked}>
      <Modal.Body>
        
        <Form.Group className="mb-3">
          <Form.Label>Create Wallets and Disperse Ether</Form.Label>
          <Row className='mb-2'>
            <Col xs={12} lg={4}>
              <InputGroup>
                {/* <InputGroup.Text>Prefix</InputGroup.Text>
                <Form.Control maxLength={10} className='flex-grow-3' required onChange={e => setWalletPrefix(e.currentTarget.value)}/> */}
                <InputGroup.Text>Amount</InputGroup.Text>
                <Form.Control defaultValue={1} min={1} type='number' required onChange={setAmount} />
              </InputGroup>
            </Col>
            <Col xs={12} lg={8}>
              <InputGroup>
                <InputGroup.Text>ETH per Wallet</InputGroup.Text>
                <Form.Control type='number' defaultValue={0} min={0} step={0.01} onChange={setEther} />
                <InputGroup.Text>Total {parseFloat((amount*ether).toFixed(3))} ETH</InputGroup.Text>
              </InputGroup>
            </Col>
          </Row>
          <Form.Text className="text-muted">
            <p className='mb-0'>{amount} wallets will be created.</p>
            <p>A total of {parseFloat((amount*ether).toFixed(3))} ETH will be distributed to between them.</p>
            
          </Form.Text>

          {/* <Form.Text className="text-muted">
            {
              walletPrefix === ''
              ? 'Enter a name for the new wallets. A number will be prepended automatically when generating multiple wallets.'
              : ''
            }
            {
              walletPrefix !== '' && amount > 1
              ? `${amount} wallets will be created with the names '${walletPrefix} 1' to '${walletPrefix} ${amount}'`
              : ''
            }
            {
              walletPrefix !== '' && amount === 1
              ? `${amount} wallet will be created with the name '${walletPrefix}'`
              : ''
            }
            
          </Form.Text> */}
        </Form.Group>
        
      </Modal.Body>
      <Modal.Footer>
        <Button 
          type='submit' 
          variant='success' 
          style={{'width': '125px'}}
          disabled={working}>
            {working ? <Spinner size='sm' animation="border" /> : 'Create Wallets'}
          </Button>
      </Modal.Footer>
      </Form>
    </Modal>
  )
}

export default CreateWalletsModal
