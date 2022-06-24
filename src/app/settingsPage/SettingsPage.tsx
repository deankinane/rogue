import React, { FormEvent, useEffect, useState } from 'react'
import { Row, Col, Card, Button, InputGroup, Form } from 'react-bootstrap'
import { Gear, Save } from 'react-bootstrap-icons';
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
      <Row className='mb-3'>
        <Col className='d-flex align-items-center'>
          <h5 className='fw-bold mb-0'><Gear className='me-3'/>Settings</h5>
        </Col>
      </Row>
      <Row>
        <Col>
          <Card>
            <Card.Body className='p-3'>
              <Form onSubmit={onFormSubmit}>
                <InputGroup className='mt-3'>
                  <InputGroup.Text>
                    RPC Node
                  </InputGroup.Text>
                  <Form.Control value={rpcUrl} onChange={v => setRpcUrl(v.currentTarget.value)} required/>
                </InputGroup>

                <Button type='submit' variant='success' className='float-end mt-3'><Save className='me-1' /> Save Changes</Button>
              </Form>
              
            </Card.Body>
            
          </Card>
        </Col>
      </Row>
    </>
    
  )
}

export default SettingsPage
