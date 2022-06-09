import { ethers } from "ethers";
import { useState } from "react";
import { Button, Form, InputGroup, Spinner } from "react-bootstrap";

export interface ContractSearchBarProps {
  onSearch: (address: string) => void
  loading: boolean
}

export default function ContractSearchBar({onSearch, loading}: ContractSearchBarProps) {

  const [address, setAddress] = useState('');
  const [valid, setValid] = useState(false);

  function loadContract() {
    if (address === '') return;
    onSearch(address);
    setValid(true);
  }

  function setValidAddress(value: string) {
    try {
      ethers.utils.getAddress(value)
      setAddress(value)
    } catch {
      setAddress('')
    }
  }

  return (
    <>
    
    <InputGroup className="card-style flex-grow-1">
      <InputGroup.Text>Address</InputGroup.Text>
      <Form.Control 
        type="text" 
        placeholder="0x0000" 
        onChange={e => setValidAddress(e.currentTarget.value)}
      />
    </InputGroup>
    {valid ? (
      <>
        <a href={`https://etherscan.io/address/${address}`} target='_blank' rel='noreferrer'><img src='img/etherscan-logo-light-circle.svg' className='mt-3 me-2' style={{'width':'1.5em'}} alt='Open Contract on Etherscan'/></a>
        <a href={`https://opensea.io/assets?search[query]=${address}`} target='_blank' rel='noreferrer'><img src='img/opensea-logo.svg' className='mt-3 me-2' style={{'width':'1.5em'}} alt='Search Contract on OpenSea'/></a>
        <a href={`https://nftnerds.ai/collection/${address}/liveview`} target='_blank' rel='noreferrer'><img src='img/nftnerds-logo.svg' className='mt-3 me-2' style={{'width':'1.5em'}} alt='Open on NFT Nerds'/></a>
      </>
    ): <></>}
    <Button 
      style={{'width':'114px'}}
      className="float-end mt-3 clearfix" 
      variant="info" 
      size="sm" 
      disabled={loading || address === ''}
      onClick={loadContract}>
         {loading ? <Spinner size='sm' animation="border" /> : <>Load Contract</>}
         
      </Button>


    </>
    
  )
}
