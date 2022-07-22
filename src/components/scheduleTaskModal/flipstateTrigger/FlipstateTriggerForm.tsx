import { FunctionFragment } from 'ethers/lib/utils'
import React, { useEffect, useState } from 'react'
import { Col, FormControl, InputGroup, Row } from 'react-bootstrap'
import { IFlipstateTriggerSettings } from '../../../application-state/taskStore/TaskInterfaces'
import MintContract from '../../../entities/MintContract'
import { getFunctionNameHex } from '../../../entities/utilityFunctions'
import FunctionSelector from '../../functionSelector/FunctionSelector'

export interface FlipstateTriggerFormProps {
  contract?: MintContract
  caller: string
  onSettingsUpdate: (settings:IFlipstateTriggerSettings) => void
}
function BackrunTriggerForm({contract, caller, onSettingsUpdate}:FlipstateTriggerFormProps) {
  const [settings, setSettings] = useState<IFlipstateTriggerSettings>({
    triggerFunction: getFunctionNameHex(contract?.writables[0].name || ''),
    caller: caller
  })

  function onFunctionSelected(f:FunctionFragment) {
    const updated = {...settings, triggerFunction : getFunctionNameHex(f.name)}
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
            <FormControl defaultValue={caller} onChange={e => setAllowedCaller(e.currentTarget.value)} />
          </InputGroup>
        </Col>
      </Row>
     
    </div>
  )
}

export default BackrunTriggerForm
