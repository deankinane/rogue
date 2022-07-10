import { useEffect } from 'react';
import { Tab, Nav } from 'react-bootstrap';
import { GraphUpArrow, Triangle, FileBinary } from 'react-bootstrap-icons';
import { loadTrendingMints } from '../../entities/IcyApi';
import WalletConnectionWidget from '../../components/walletConnectionWidget/WalletConnectionWidget';
import './LeftPanel.css';

export default function LeftPanel() {

  useEffect(() => {
    // loadTrendingMints()
  },[])
  return (
    <div className='left-panel'>
      <div className="left-panel__logo">
        <img src="./img/rogue_logo.svg" alt="ROGUE Logo - Mint NFTs Fast" />
        <div className="flex-grow-1 justify-content-end">
          <WalletConnectionWidget />
        </div>
      </div>
      <Tab.Container defaultActiveKey="sales">
          <Nav variant="pills">
            <Nav.Item>
              <Nav.Link eventKey="sales"><GraphUpArrow />Trending</Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link eventKey="mints"><Triangle />Minting</Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link eventKey="contracts"><FileBinary />Contracts</Nav.Link>
            </Nav.Item>
          </Nav>
          <Tab.Content className='light-panel'>
            <Tab.Pane eventKey="sales">
              
            </Tab.Pane>
            <Tab.Pane eventKey="mints">
              
            </Tab.Pane>
            <Tab.Pane eventKey="contracts">
              
            </Tab.Pane>
          </Tab.Content>
        </Tab.Container>
    </div>
  )
}
