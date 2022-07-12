import React, { FormEvent, useEffect, useState } from 'react'
import { Row, Col, Button, InputGroup, Form } from 'react-bootstrap'
import { GearFill, Save } from 'react-bootstrap-icons';
import { defaultSettings } from '../../application-state/settingsStore/ISettingsState';
import { useSettingsStore } from '../../application-state/settingsStore/SettingsStore';
import useToast from '../../hooks/useToast';
import './SettingsPage.css';

function SettingsPage() {
  const sendToast = useToast()
  const {settings, updateSettings} = useSettingsStore()
  const [updatedSettings, setUpdatedSettings] = useState(defaultSettings)

  useEffect(() => {
    setUpdatedSettings(s => (settings))
  },[settings])
  
  function onNodeUrlChanged(url:string) {
    setUpdatedSettings(s => {
      s.node.rpcUrl = url
      return s
    })
  }

  function onFormSubmit(e: FormEvent) {
    e.preventDefault();
    updateSettings(updatedSettings)
    sendToast('Settings Updated', 'Your changes have been saved.', 'success');
  }

  return (
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
            <Form.Control defaultValue={updatedSettings.node.rpcUrl}  onChange={v => onNodeUrlChanged(v.currentTarget.value)} required/>
          </InputGroup>
        </Col>
      </Row>
    </Form>
  )
}

export default SettingsPage
