import React from 'react'
import { Button, ButtonGroup, Col, Row } from 'react-bootstrap'
import { BoxArrowUpRight, Clipboard, XSquare } from 'react-bootstrap-icons'
import IWalletRecord from '../../entities/IWalletRecord'
import './WalletRecord.css'

export interface WalletRecordProps {
  wallet: IWalletRecord
}

function WalletRecord({wallet}:WalletRecordProps) {
  return (
    <Row className='wallet-record mt-1'>
      <Col xs={3} className='d-flex align-items-center'>
        <p className='mb-0'>{wallet.name}</p>
      </Col>
      <Col xs={7} lg={5} className='d-flex align-items-center'>
        <Button variant='dark me-2'>
          <Clipboard/>
        </Button>
        <p className='mb-0'>{wallet.publicKey}</p>
      </Col>
      <Col xs={2}>
      <p className='mb-0'>{parseFloat(wallet.balance.toString()).toFixed(3)} ETH</p>
      </Col>
      <Col xs={12} lg={2} className='mt-3 mt-lg-0'>
        <ButtonGroup className='float-end'>
          <Button variant="dark"><XSquare /></Button>
          <a 
            href={`https://etherscan.io/address/${wallet.publicKey}`}
            target='_blank'
            rel='noreferrer'
          >
              <Button variant="dark"><BoxArrowUpRight /></Button>
          </a>
        </ButtonGroup>
      </Col>
    </Row>
  )
}

export default WalletRecord
