import React, { ChangeEvent, useState } from 'react'
import { Col, Form, Row } from 'react-bootstrap';
import IWalletRecord from '../../entities/IWalletRecord'
import useOnMount from '../../hooks/useOnMount';
import useWalletStorage from '../../hooks/useWalletStorage'
import './WalletSelector.css'

export interface WalletSelectorProps {
  onWalletSelectionChanged: (selectedWallets: IWalletRecord[]) => void
}

function WalletSelector({onWalletSelectionChanged}:WalletSelectorProps) {
  const [wallets] = useWalletStorage();
  let selectedWallets = new Array<IWalletRecord>();

  useOnMount(() => {
    selectedWallets.push(wallets[0]);
    onWalletSelectionChanged(selectedWallets)
  })
  

  function onCheckStateChanged(e: ChangeEvent<HTMLInputElement>, w: IWalletRecord) {
    if (e.currentTarget.checked) {
      selectedWallets.push(w);
    }
    else {
      selectedWallets = selectedWallets.filter(x => x.name !== w.name);
    }

    onWalletSelectionChanged(selectedWallets);
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
              <p className='text-end flex-grow-1 mb-0 text-secondary'>{w.publicKey.substring(0,6)+'...'}</p>
            </div>
          </Col>
        ))}
      </Row>
    </div>
  )
}

export default WalletSelector
