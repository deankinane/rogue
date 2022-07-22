import React, { useState } from 'react'
import { InputGroup, Form } from 'react-bootstrap'
import { useWalletStore } from '../../../application-state/walletStore/WalletStore'

function DisperseEtherWidget() {
  const {wallets} = useWalletStore()
  const [ether, setEther] = useState(0.05)
  const [from, setFrom] = useState(1)
  const [to, setTo] = useState(1)
  
  return (
    <div className='d-flex'>
      <div className='flex-grow-1 me-3'>
        <InputGroup>
          <InputGroup.Text>Wallets</InputGroup.Text>
          <Form.Control type='number' defaultValue={1} step={1} min={1} onChange={e => setFrom(parseInt(e.currentTarget.value))}/>
          <InputGroup.Text>to</InputGroup.Text>
          <Form.Control type='number' defaultValue={wallets.length} step={1} max={wallets.length} onChange={e => setTo(parseInt(e.currentTarget.value))}/>
          <InputGroup.Text>of {wallets.length}</InputGroup.Text>
        </InputGroup>
      </div>
      <div>
       <InputGroup>
          <InputGroup.Text>ETH per Wallet</InputGroup.Text>
          <Form.Control defaultValue={1} min={1} type='number' required onChange={e => setEther(parseFloat(e.currentTarget.value))} />
          <InputGroup.Text>Total {parseFloat(((to - from)*ether).toFixed(3))} ETH</InputGroup.Text>
        </InputGroup>
      </div>
       
       
    </div>
  )
}

export default DisperseEtherWidget
