import { FunctionFragment } from 'ethers/lib/utils'
import React, { useState } from 'react'
import { Col, FormControl, InputGroup, Row } from 'react-bootstrap'
import { IFlipstateTriggerSettings } from '../../../application-state/taskStore/TaskInterfaces'
import MintContract from '../../../entities/MintContract'
import FunctionSelector from '../../functionSelector/FunctionSelector'

export interface FlipstateTriggerFormProps {
  contract?: MintContract
  onSettingsUpdate: (settings:IFlipstateTriggerSettings) => void
}
function BackrunTriggerForm({contract, onSettingsUpdate}:FlipstateTriggerFormProps) {
  const [settings, setSettings] = useState<IFlipstateTriggerSettings>({
    triggerFunction: contract?.abi?.getSighash(contract?.writables[0].name) || '',
    caller: contract?.owner || ''
  })

  function onFunctionSelected(f:FunctionFragment) {
    const updated = {...settings, triggerFunction : contract?.abi?.getSighash(f.name) || ''}
    setSettings(updated)
    onSettingsUpdate(updated)
  }

  function setAllowedCaller(address: string) {
    const updated = {...settings, caller: address}
    setSettings(updated)
    onSettingsUpdate(updated)
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
        <Col xs={12} xl={6}>
          <InputGroup>
            <InputGroup.Text>Caller</InputGroup.Text>
            <FormControl defaultValue={contract?.owner} onChange={e => setAllowedCaller(e.currentTarget.value)} />
          </InputGroup>
        </Col>
      </Row>
     
    </div>
  )
}

export default BackrunTriggerForm
