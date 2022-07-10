import React from 'react'
import { Tab, Nav } from 'react-bootstrap'
import { WalletFill, CollectionFill, Calendar2DateFill, GearFill } from 'react-bootstrap-icons'
import CollectionManager from '../collectionManager/CollectionManager'
import SettingsPage from '../settingsPage/SettingsPage'
import TaskManager from '../taskManager/TaskManager'
import WalletManager from '../walletManager/WalletManager'
import './RightPanel.css'

function RightPanel() {
  return (
    <div className='right-panel h-100'>
      <Tab.Container defaultActiveKey="wallets">
        <Nav variant="pills">
          <Nav.Item>
            <Nav.Link eventKey="wallets"><WalletFill /> Wallets</Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link eventKey="collections"><CollectionFill /> Collections</Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link eventKey="tasks"><Calendar2DateFill /> Tasks</Nav.Link>
          </Nav.Item>
          <Nav.Item className="float-end">
            <Nav.Link eventKey="settings"><GearFill /> Settings</Nav.Link>
          </Nav.Item>
        </Nav>
        <Tab.Content>
          <Tab.Pane eventKey="wallets">
            <WalletManager />
          </Tab.Pane>
          <Tab.Pane eventKey="collections">
            <CollectionManager />
          </Tab.Pane>
          <Tab.Pane eventKey="tasks">
            <TaskManager />
          </Tab.Pane>
          <Tab.Pane eventKey="settings">
            <SettingsPage />
          </Tab.Pane>
        </Tab.Content>
      </Tab.Container>
    </div>
  )
}

export default RightPanel
