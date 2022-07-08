import { ParamType } from 'ethers/lib/utils'
import React, { ChangeEvent, useEffect, useState } from 'react'
import { InputGroup, Form } from 'react-bootstrap'
import { ParamTypes } from '../../entities/constants'
import { CustomParam } from '../../entities/GlobalState'
export interface CustomFunctionParamProps {
  functionParam: ParamType
  onParamUpdated: (param: CustomParam) => void
}
function CustomFunctionParam({functionParam, onParamUpdated}:CustomFunctionParamProps) {
  const [param, setParam] = useState<CustomParam>({
    name: '',
    type: ParamTypes.uint256,
    isArray: false,
    value: '',
    autoWalletAddress: false,
    isAmountField: false
  });

  useEffect(() => {
    setParam({
      name: functionParam.name,
      type: functionParam.type.replace('[]', '') as ParamTypes,
      isArray: functionParam.type.endsWith('[]'),
      value: '',
      autoWalletAddress: false,
      isAmountField: false
    })
  },[functionParam])

  function updateParamValue(value: string) {
    param.value = value;
    setParam(param);
    onParamUpdated(param);
  }

  function setAutoWalletAddress(e: ChangeEvent<HTMLInputElement>) {
    param.autoWalletAddress = e.currentTarget.checked;
    setParam(param);
    onParamUpdated(param);
  }

  return (
    <InputGroup className="mt-3">
      <InputGroup.Text className="mw-30">{param.name}</InputGroup.Text>
      <Form.Control 
      placeholder={param.type} 
      type={param.type.startsWith('uint') && !param.isArray ? 'number' : 'text'} 
      onChange={v => updateParamValue(v.currentTarget.value)}
      disabled={param.autoWalletAddress} />
      {
        param.type === ParamTypes.address && !param.isArray 
        ? <InputGroup.Checkbox 
          aria-label="Auto address" 
          label="Use Wallet Address" 
          title="Use Wallet Address"  
          onChange={setAutoWalletAddress} />
        : <></>
      }
    </InputGroup>
  )
}

export default CustomFunctionParam
