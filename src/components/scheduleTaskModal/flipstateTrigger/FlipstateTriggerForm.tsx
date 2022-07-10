import { FunctionFragment } from 'ethers/lib/utils'
import React from 'react'
import { Col, Row } from 'react-bootstrap'
import { IFlipstateTriggerSettings } from '../../../application-state/taskContext/TaskContext'
import MintContract from '../../../entities/MintContract'
import { getFunctionNameHex } from '../../../entities/utilityFunctions'
import FunctionSelector from '../../functionSelector/FunctionSelector'

export interface FlipstateTriggerFormProps {
  contract?: MintContract
  onSettingsUpdate: (settings:IFlipstateTriggerSettings) => void
}
function BackrunTriggerForm({contract, onSettingsUpdate}:FlipstateTriggerFormProps) {
  
  function onFunctionSelected(f:FunctionFragment) {
    onSettingsUpdate({
      triggerFunction: getFunctionNameHex(f.name)
    })
  }

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
