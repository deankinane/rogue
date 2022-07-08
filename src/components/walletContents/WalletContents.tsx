import React, { } from 'react'
import { Row } from 'react-bootstrap'
import IWalletRecord from '../../entities/IWalletRecord'
import WalletItem from './walletItem/WalletItem'
import './WalletContents.css'

export interface WalletContentsProps {
  wallet : IWalletRecord
}

function WalletContents({wallet}: WalletContentsProps) {  
  return (
    <div className='wallet-container mb-4 pb-4'>
      <div className='d-flex wallet-container-header mb-4'>
        <div className='flex-grow-1'>{wallet.name}</div>
        <div>{wallet.publicKey.substring(0,6)}</div>
      </div>
      
      <Row className='g-3'>
        {wallet.contents 
        ? wallet.contents.map((x,i) => <WalletItem key={i} nft={x} />)
        : <></>
        }
      </Row>

    </div>
  )
}

export default WalletContents
