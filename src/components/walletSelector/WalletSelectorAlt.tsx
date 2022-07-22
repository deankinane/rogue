import React, { useState } from 'react'
import { Form, InputGroup } from 'react-bootstrap'
import { IWallet } from '../../application-state/walletStore/WalletInterface'
import { useWalletStore } from '../../application-state/walletStore/WalletStore'

export interface WalletSelectorAltProps {
  onWalletSelectionChanged: (selectedWallets: IWallet[]) => void
}

function WalletSelectorAlt({onWalletSelectionChanged}:WalletSelectorAltProps) {
  const {wallets} = useWalletStore()
  const [from, setFrom] = useState(1)
  const [to, setTo] = useState(1)

  function onFromChanged(f: number){
    setFrom(f)
    onWalletSelectionChanged(wallets.slice(f-1, to))
  }

  function onToChanged(t: number){
    setTo(t)
    onWalletSelectionChanged(wallets.slice(from-1, t))
  }

  return (
    <div>
      <InputGroup>
        <InputGroup.Text>Mint with wallets</InputGroup.Text>
        <Form.Control type='number' defaultValue={1} step={1} min={1} onChange={e => onFromChanged(parseInt(e.currentTarget.value))}/>
        <InputGroup.Text>to</InputGroup.Text>
        <Form.Control type='number' defaultValue={wallets.length} step={1} max={wallets.length} onChange={e => onToChanged(parseInt(e.currentTarget.value))}/>
        <InputGroup.Text>of {wallets.length}</InputGroup.Text>
      </InputGroup>
    </div>
  )
}

export default WalletSelectorAlt
