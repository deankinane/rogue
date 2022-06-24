import { FunctionFragment } from 'ethers/lib/utils'
import React, { useState } from 'react'
import { Row, Col, InputGroup, Form, FormControl, Button } from 'react-bootstrap'
import { ChevronLeft, ChevronRight } from 'react-bootstrap-icons'
import MintContract from '../../../entities/MintContract'
import FunctionSelector from '../../functionSelector/FunctionSelector'

export interface TargetValueFormProps {
  contract?: MintContract
}

export enum ValueCondition {
  equals = 'Equals',
  greaterthan = 'Greater Than',
  lessthan = 'Less Than'
}

function TargetValueForm({contract}:TargetValueFormProps) {
  const [valueFunction, setValueFunction] = useState<FunctionFragment>();
  const [condition, setCondition] = useState(ValueCondition.greaterthan);
  const [value, setValue] = useState('');
  const [valueType, setValueType] = useState('');

  function onFunctionSelected(f:FunctionFragment) {
    setValueFunction(f)
    if(f && f.outputs)
      setValueType(f.outputs[0].type);
  }
  
  return (
    <div>
      <p className='modal-section__title'>Choose Trigger Function</p>
      <Row className='g-2'>
        <Col xs={12} xl={6}>
          <FunctionSelector 
            label="Trigger Function"
            functions={contract?.viewables} 
            onFunctionSelected={onFunctionSelected}
          />
        </Col>
        <Col xs={12} xl={6}>
          {
            (valueType.startsWith('uint'))
            ? 
            <InputGroup>
              <Button variant='info' onClick={() => setCondition(ValueCondition.lessthan)}><ChevronLeft /></Button>
              <Button variant='info' onClick={() => setCondition(ValueCondition.equals)}>=</Button>
              <Button variant='info' onClick={() => setCondition(ValueCondition.greaterthan)}><ChevronRight /></Button>
              <InputGroup.Text className='mw-30'>{condition}</InputGroup.Text>
              <FormControl 
                type='number' 
                step={1}
                onChange={v => setValue(v.currentTarget.value)}
                />
            </InputGroup>
            : <></>
          }
        </Col>
      </Row>
    </div>
  )
}

export default TargetValueForm
