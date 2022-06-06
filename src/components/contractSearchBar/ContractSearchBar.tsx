import { useState } from "react";
import { Button, Form, InputGroup, Spinner } from "react-bootstrap";

export interface ContractSearchBarProps {
  onSearch: (address: string) => void
  loading: boolean
}

export default function ContractSearchBar({onSearch, loading}: ContractSearchBarProps) {

  const [address, setAddress] = useState("");

  function loadContract() {
    if (address === "") return;
    onSearch(address);
  }

  return (
    <>
    
    <InputGroup className="card-style flex-grow-1">
      <InputGroup.Text>Address</InputGroup.Text>
      <Form.Control 
        type="text" 
        placeholder="0x0000" 
        onChange={e => setAddress(e.currentTarget.value)}
      />
    </InputGroup>
    
    <Button 
      style={{'width':'114px'}}
      className="float-end mt-3 clearfix" 
      variant="info" 
      size="sm" 
      disabled={loading}
      onClick={loadContract}>
         {loading ? <Spinner size='sm' animation="border" /> : <>Load Contract</>}
         
      </Button>


    </>
    
  )
}
