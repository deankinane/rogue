import { useEffect } from 'react';
import { Tab, Nav } from 'react-bootstrap';
import { WalletFill, Calendar2DateFill, GearFill } from 'react-bootstrap-icons';
import { Link } from 'react-router-dom';
import { loadTrendingMints } from '../../entities/IcyApi';
import WalletConnectionWidget from '../walletConnectionWidget/WalletConnectionWidget';
import './SiteHeader.css';

export default function SiteHeader() {

  useEffect(() => {
    loadTrendingMints()
  },[])
  return (
    <div className='header'>
      <div className="header__logo">
        <Link to="/"><img src="./img/rogue_logo.svg" alt="ROGUE Logo - Mint NFTs Fast" /></Link>
        <div className="flex-grow-1 justify-content-end">
          <WalletConnectionWidget />
        </div>
      </div>
      <Tab.Container defaultActiveKey="sales">
          <Nav variant="pills">
            <Nav.Item>
              <Nav.Link eventKey="sales">Trending</Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link eventKey="mints">Minting</Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link eventKey="contracts">Contracts</Nav.Link>
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
