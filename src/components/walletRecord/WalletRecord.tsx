import React from 'react'
import { Button, ButtonGroup, Col, Row } from 'react-bootstrap'
import { BoxArrowUpRight, Clipboard, Pen, XSquare } from 'react-bootstrap-icons'
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
      <Col xs={9} lg={6} className='d-flex align-items-center'>
        <p className='mb-0'>{wallet.publicKey}</p>
        <Button variant='dark ms-2'>
          <Clipboard/>
        </Button>
      </Col>
      <Col xs={12} lg={3} className='mt-3 mt-lg-0'>
        <ButtonGroup className='float-end'>
          <Button variant="dark"><XSquare /></Button>
          <Button variant="dark"><Pen /></Button>
          <Button variant="dark"><BoxArrowUpRight /></Button>
        </ButtonGroup>
      </Col>
    </Row>
  )
}

export default WalletRecord
