import Blocknative from 'bnc-sdk';
import { Account, Emitter, TransactionEvent } from 'bnc-sdk/dist/types/src/interfaces';
import React, { FormEvent, FormEventHandler, useRef, useState } from 'react'
import { Row, Col, Card, Button, InputGroup, Form } from 'react-bootstrap'
import { Gear, Save, Wallet } from 'react-bootstrap-icons';
import useNodeStorage from '../../hooks/useNodeStorage';
import useOnMount from '../../hooks/useOnMount';
import './SettingsPage.css';

function SettingsPage() {

  const [node, setNode] = useNodeStorage();
  const [wssUrl, setWssUrl] = useState('')
  const [rpcUrl, setRpcUrl] = useState('')

  const socket = useRef<Blocknative>();
  const emitter = useRef<Emitter>();
  const suscribed = useRef(false);
  const count = useRef(0);
  
  useOnMount(() => {
    document.title = 'ROGUE - Mint NFTs FAST'
    setWssUrl(node ? node.wssUrl : '')
    setRpcUrl(node ? node.rpcUrl : '')
  })

  function openSocket() {
    socket.current = new Blocknative({
      dappId: "01d4a2a2-197a-436c-a13a-29ae93a68db0",
      networkId: 1,
      onerror: e => console.log('error', e)
    })

    const account = socket.current.account("0x56E5003cc86E75e750FBdb4716C80a2a22D2B5C5")
    emitter.current = account.emitter;

    emitter.current.on("txPool", txn => {
      console.log(txn)
      count.current++;
      if(count.current >=10) {
        socket.current?.unsubscribe("0x56E5003cc86E75e750FBdb4716C80a2a22D2B5C5")
      }
    })
  }

  
//   const msgBase = {
//     dappId: "01d4a2a2-197a-436c-a13a-29ae93a68db0",
//     version: "1",
//     blockchain: {
//       system: "ethereum",
//       network: "main"
//     }
//   }

//   function openSocket() {
//     socket.current = new WebSocket('wss://api.blocknative.com/v0'); 
//     socket.current.onopen = e => {
//       console.log('open', e);
//       const msg = {
//         ...msgBase,
//         timestamp: new Date(),
//         categoryCode: "initialize",
//         eventCode: "checkDappId"
//       }
//       socket.current?.send(JSON.stringify(msg));
//     }

//     socket.current.onmessage = e => {
      
//       if(!suscribed.current) {
//         suscribed.current = true;
//         const msg = {
//           ...msgBase,
//           timestamp: new Date(),
//           categoryCode: "accountAddress",
//           eventCode: "watch",
//           account: {
//             address: "0x56E5003cc86E75e750FBdb4716C80a2a22D2B5C5"
//           }
//         }
//         console.log("subscribing", msg)
//         socket.current?.send(JSON.stringify(msg));
//       }
//       else {
//         console.log('watched',e)
//         count.current++;
//         if(count.current === 10) {
//           const msg = {
//             ...msgBase,
//             timestamp: new Date(),
//             categoryCode: "accountAddress",
//             eventCode: "unwatch",
//             account: {
//               address: "0x56E5003cc86E75e750FBdb4716C80a2a22D2B5C5"
//             }
//           }
//           console.log("unsubscribing", msg)
//           socket.current?.send(JSON.stringify(msg));
//         }
//       }
//     }
//     socket.current.onerror = e => {
//       console.log('error',e)
//     }

//     socket.current.onclose = e => {
//       console.log('close',e)
//     }
//   }

  function onFormSubmit(e: FormEvent) {
    e.preventDefault();
    
    setNode({
      wssUrl: wssUrl,
      rpcUrl: rpcUrl,
      chainId:  1
    })
  }

  return (
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
                <InputGroup>
                  <InputGroup.Text>
                    WSS Node 
                  </InputGroup.Text>
                  <Form.Control value={wssUrl} onChange={v => setWssUrl(v.currentTarget.value)} required/>
                </InputGroup>
                <InputGroup className='mt-3'>
                  <InputGroup.Text>
                    RPC Node
                  </InputGroup.Text>
                  <Form.Control value={rpcUrl} onChange={v => setRpcUrl(v.currentTarget.value)} required/>
                </InputGroup>

                <Button type='submit' variant='success' className='float-end mt-3'><Save className='me-1' /> Save Changes</Button>
                <Button onClick={openSocket}>Socket</Button>
              </Form>
              
            </Card.Body>
            
          </Card>
        </Col>
      </Row>
    </>
    
  )
}

export default SettingsPage
