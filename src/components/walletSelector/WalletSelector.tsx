import { ethers } from 'ethers';
import React, { ChangeEvent, useEffect, useRef } from 'react'
import { Col, Form, Row } from 'react-bootstrap';
import IWalletRecord from '../../entities/IWalletRecord'
import useOnMount from '../../hooks/useOnMount';
import './WalletSelector.css'

export interface WalletSelectorProps {
  wallets: IWalletRecord[]
  onWalletSelectionChanged: (selectedWallets: IWalletRecord[]) => void
}

function WalletSelector({wallets, onWalletSelectionChanged}:WalletSelectorProps) {
  const selectedWallets = useRef(new Array<IWalletRecord>());

  useEffect(() => {
    if(wallets.length > 0 && selectedWallets.current.length === 0) {
      selectedWallets.current.push(wallets[0]);
      onWalletSelectionChanged(selectedWallets.current)
    }
  }, [wallets])

  function onCheckStateChanged(e: ChangeEvent<HTMLInputElement>, w: IWalletRecord) {
    if (e.currentTarget.checked) {
      selectedWallets.current.push(w);
    }
    else {
      selectedWallets.current = selectedWallets.current.filter(x => x.name !== w.name);
    }

    onWalletSelectionChanged(selectedWallets.current);
  }

  return (
    <div>      
      <Row className='g-2'>
        {wallets.map((w, i) => (
          <Col key={i} xs={6} >
            <div className='wallet-selector d-flex'>
              <Form.Check className='wallet-selector__checkbox'
                type='switch'
                defaultChecked={i===0}
                onChange={e => onCheckStateChanged(e, w)}
                label={w.name}
              />
              <p className='text-end flex-grow-1 mb-0 text-secondary'>{parseFloat(w.balance.toString()).toFixed(3)}</p>
            </div>
          </Col>
        ))}
      </Row>
    </div>
  )
}

export default WalletSelector
