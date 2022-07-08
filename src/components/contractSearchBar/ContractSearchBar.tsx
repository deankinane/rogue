import { ethers } from "ethers";
import { useState } from "react";
import { Button, Form, InputGroup, Spinner } from "react-bootstrap";
import MintContract from "../../entities/MintContract";
import useToast from "../../hooks/useToast";

export interface ContractSearchBarProps {
  onContractLoaded: (contract: MintContract) => void

}

export default function ContractSearchBar({onContractLoaded}: ContractSearchBarProps) {
  const sendToast = useToast();
  const [address, setAddress] = useState('');
  const [valid, setValid] = useState(false);
  const [loading, setLoading] = useState(false)
  const [slug, setSlug] = useState('')

  function loadContract() {
    if (address === '') return;
    setLoading(true);
    const newContract = new MintContract(address);
    newContract.init().then(() => {
      setSlug(newContract.contractSlug)
      setAddress(address)
      setValid(true)
      onContractLoaded(newContract)
      setLoading(false)
    })
    .catch(e => {
      sendToast('Load Contract Failed', e.message, 'error');
      setLoading(false);
    })
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
    
    <InputGroup className="flex-grow-1 mt-3">
      <InputGroup.Text>Address</InputGroup.Text>
      <Form.Control 
        type="text"
        onChange={e => setValidAddress(e.currentTarget.value)}
      />
    </InputGroup>
    {valid ? (
      <>
        <a href={`https://etherscan.io/address/${address}`} target='_blank' rel='noreferrer'><img src='img/etherscan-logo-light-circle.svg' className='mt-3 me-2' style={{'width':'1.5em'}} alt='Open Contract on Etherscan'/></a>
        {slug !== '' 
          ? <a href={`https://opensea.io/collection/${slug}`} target='_blank' rel='noreferrer'><img src='img/opensea-logo.svg' className='mt-3 me-2' style={{'width':'1.5em'}} alt='Open Collection on OpenSea'/></a>
          : <a href={`https://opensea.io/assets?search[query]=${address}`} target='_blank' rel='noreferrer'><img src='img/opensea-logo.svg' className='mt-3 me-2' style={{'width':'1.5em'}} alt='Search Contract on OpenSea'/></a>
        }
        <a href={`https://nftnerds.ai/collection/${address}/liveview`} target='_blank' rel='noreferrer'><img src='img/nftnerds-logo.svg' className='mt-3 me-2' style={{'width':'1.5em'}} alt='Open on NFT Nerds'/></a>
        <a href={`https://nfteye.io/collections/${slug}#sniper`} target='_blank' rel='noreferrer'><img src='img/nfteye-logo.svg' className='mt-3 me-2' style={{'width':'1.5em'}} alt='Open on NFT Nerds'/></a>
      </>
    ): <></>}
    <Button 
      style={{'width':'114px'}}
      className="float-end mt-2 clearfix" 
      variant="info" 
      size="sm" 
      disabled={loading || address === ''}
      onClick={loadContract}>
         {loading ? <Spinner size='sm' animation="border" /> : <>Load Contract</>}
         
      </Button>


    </>
    
  )
}
