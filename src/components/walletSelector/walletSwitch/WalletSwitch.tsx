import React, { ChangeEvent } from 'react'
import { Form } from 'react-bootstrap'
import IWalletRecord from '../../../entities/IWalletRecord'
export interface WalletSwitchProps {
  wallet: IWalletRecord
  defaultState: boolean
  onCheckStateChanged: (e: ChangeEvent<HTMLInputElement>, w: IWalletRecord) => void
}

function WalletSwitch({wallet, defaultState, onCheckStateChanged}:WalletSwitchProps) {
  return (
    <div className='wallet-selector d-flex'>
      <Form.Check className='wallet-selector__checkbox'
        type='switch'
        defaultChecked={defaultState}
        onChange={e => onCheckStateChanged(e, wallet)}
        label={wallet.name}
      />
      <p className='text-end flex-grow-1 mb-0 text-secondary'>{`${wallet.balance}`}</p>
    </div>
  )
}

export default WalletSwitch
