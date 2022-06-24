import { FunctionFragment } from 'ethers/lib/utils'
import React from 'react'
import { Col, Row } from 'react-bootstrap'
import MintContract from '../../../entities/MintContract'
import FunctionSelector from '../../functionSelector/FunctionSelector'

export interface BackrunTriggerSettings {
  triggerFunction: FunctionFragment
}

export interface BackrunTriggerFormProps {
  contract?: MintContract
  onSettingsUpdate: (settings:BackrunTriggerSettings) => void
}
function BackrunTriggerForm({contract, onSettingsUpdate}:BackrunTriggerFormProps) {
  function onFunctionSelected(f:FunctionFragment) {}
  return (
    <div>
      <p className='modal-section__title'>Choose Trigger Function</p>
      <Row>
        <Col xs={12} xl={6}>
          <FunctionSelector 
            label="Trigger Function"
            functions={contract?.writables} 
            onFunctionSelected={onFunctionSelected}
          />
        </Col>
      </Row>
     
    </div>
  )
}

export default BackrunTriggerForm
