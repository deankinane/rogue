import React, { ChangeEvent, useContext, useEffect, useRef } from 'react'
import { Col, Row } from 'react-bootstrap';
import { IWalletRecord, WalletContext } from '../../application-state/walletContext/WalletContext';
import WalletSwitch from './walletSwitch/WalletSwitch';
import './WalletSelector.css'

export interface WalletSelectorProps {
  onWalletSelectionChanged: (selectedWallets: IWalletRecord[]) => void
}

function WalletSelector({onWalletSelectionChanged}:WalletSelectorProps) {
  const {wallets} = useContext(WalletContext)
  const selectedWallets = useRef(new Array<IWalletRecord>())
  const loaded = useRef(false);

  useEffect(() => {
    if(loaded.current) return;

    if(wallets.length > 0 && selectedWallets.current.length === 0) {
      selectedWallets.current.push(wallets[0]);
      onWalletSelectionChanged(selectedWallets.current)
      loaded.current = true;
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
          <Col key={i} xs={12} xl={6} >
            <WalletSwitch 
              defaultState={i===0} 
              wallet={w} 
              onCheckStateChanged={onCheckStateChanged} />
          </Col>
        ))}
      </Row>
    </div>
  )
}

export default WalletSelector
