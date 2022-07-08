import React, { FormEvent, useEffect, useState } from 'react'
import { Row, Col, Card, Button, InputGroup, Form } from 'react-bootstrap'
import { Gear, GearFill, Save } from 'react-bootstrap-icons';
import { useNavigate } from 'react-router-dom';
import useIsLicensed from '../../hooks/useIsLicensed';
import useNodeStorage from '../../hooks/useNodeStorage';
import useOnMount from '../../hooks/useOnMount';
import useSignedIn from '../../hooks/useSignedIn';
import useToast from '../../hooks/useToast';
import './SettingsPage.css';

function SettingsPage() {

  const [node, setNode] = useNodeStorage();
  const [rpcUrl, setRpcUrl] = useState('')
  const licensed = useIsLicensed();
  const navigate = useNavigate();
  const [render, setRender] = useState(false);
  const [signedIn] = useSignedIn();
  const sendToast = useToast();
  
  useEffect(() => {
    if (!licensed.checked) return;
    if (!licensed.licensed || !signedIn) navigate('/');
    setRender(true);
  },[licensed, signedIn])
  
  useOnMount(() => {
    document.title = 'ROGUE - Mint NFTs Fast'
    setRpcUrl(node ? node.rpcUrl : '')
  })

  function onFormSubmit(e: FormEvent) {
    e.preventDefault();
    
    setNode({
      rpcUrl: rpcUrl,
      chainId:  1
    })

    sendToast('Settings Updated', 'Your changes have been saved.', 'success');
  }

  return (
    !render ? <></> : 
    <>
    <Form onSubmit={onFormSubmit}>
      <div className="d-flex mb-4">
        <h5 className='fw-bold mb-0 flex-grow-1'><GearFill className='me-3'/>Settings</h5>
        <Button 
          type='submit'
          variant='success' 
          className='mb-4'>
            <Save className='me-2'/> Save Changes
        </Button>
      </div>
      <Row>
        <Col>
          <InputGroup>
            <InputGroup.Text>
              RPC Node
            </InputGroup.Text>
            <Form.Control value={rpcUrl} onChange={v => setRpcUrl(v.currentTarget.value)} required/>
          </InputGroup>
        </Col>
      </Row>
      </Form>
    </>
    
  )
}

export default SettingsPage
