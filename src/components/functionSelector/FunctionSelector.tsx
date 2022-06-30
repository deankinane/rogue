import { FunctionFragment } from "ethers/lib/utils";
import {  ChangeEvent, useEffect, useRef } from "react";
import { Form, InputGroup } from "react-bootstrap";

export interface FunctionSelectorProps {
  label: string
  functions: FunctionFragment[] | undefined
  onFunctionSelected: (f:FunctionFragment) => void
  children?: JSX.Element | JSX.Element[] | undefined
}

export default function FunctionSelector({label, functions, onFunctionSelected, children} : FunctionSelectorProps) {
  //const [selectedFunction, setSelectedFunction] = useState<FunctionFragment>();
  const selectField = useRef<HTMLSelectElement>(null);
  const previousSelection = useRef(0);

  useEffect(() => {
    if (functions && functions.length >= 1) {
      onFunctionSelected(functions[0]);
    }
  }, [functions])

  function selectFunction(event:ChangeEvent<HTMLSelectElement>) {
    const idx = parseInt(event.currentTarget.value);
    if (functions)  {
      //setSelectedFunction(functions[idx]);
      onFunctionSelected(functions[idx]);
      selectField.current?.blur();
    }
  }
  function clearSelection() {
    if (selectField.current) {
      previousSelection.current = selectField.current.selectedIndex
      selectField.current.selectedIndex = -1
    }
  }

  function onBlur() {
    if (selectField.current && selectField.current.selectedIndex === -1)
      selectField.current.selectedIndex = previousSelection.current 
  }

  return (
    <InputGroup>
      <InputGroup.Text>{label}</InputGroup.Text>
      <Form.Select 
        onChange={selectFunction} 
        placeholder="Select a function" 
        ref={selectField} 
        onMouseDown={clearSelection}
        onBlur={onBlur}>
        {functions?.map((x,i) => <option key={i} value={i}>{x.name}</option>)}
      </Form.Select>
    </InputGroup>
  )
}
