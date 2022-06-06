import { FunctionFragment } from "ethers/lib/utils";
import {  ChangeEvent, useEffect } from "react";
import { Form, InputGroup } from "react-bootstrap";

export interface FunctionSelectorProps {
  functions: FunctionFragment[] | undefined
  onFunctionSelected: (f:FunctionFragment) => void
  children?: JSX.Element | JSX.Element[] | undefined
}

export default function FunctionSelector({functions, onFunctionSelected, children} : FunctionSelectorProps) {
  //const [selectedFunction, setSelectedFunction] = useState<FunctionFragment>();

  useEffect(() => {
    if (functions && functions.length >= 1) {
      //setSelectedFunction(functions[0]);
      onFunctionSelected(functions[0]);
    }
  }, [functions])

  function selectFunction(event:ChangeEvent<HTMLSelectElement>) {
    const idx = parseInt(event.currentTarget.value);
    if (functions)  {
      //setSelectedFunction(functions[idx]);
      onFunctionSelected(functions[idx]);
    }
  }

  return (
    <InputGroup>
      <InputGroup.Text>Mint Function</InputGroup.Text>
      <Form.Select onChange={selectFunction} placeholder="Select a function" >
      {functions?.map((x,i) => <option key={i} value={i}>{x.name}</option>)}
      </Form.Select>
    </InputGroup>
  )
}
