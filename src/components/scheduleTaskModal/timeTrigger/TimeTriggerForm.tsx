import React from 'react'
import { Col, Form, Row } from 'react-bootstrap'
import MintContract from '../../../entities/MintContract'

export interface TimeTriggerFormProps {
  contract?: MintContract
}

function TimeTriggerForm({contract}: TimeTriggerFormProps) {
  return (
    <div>
    <p className='modal-section__title'>Choose Date and Time</p>
    <Row className='g-2'>
      <Col xs={6} xl={3}>
        <Form.Control type="date" />        
      </Col>
      <Col xs={6} xl={3}>
        <Form.Control type="time" />        
      </Col>
    </Row>
   
  </div>
  )
}

export default TimeTriggerForm
