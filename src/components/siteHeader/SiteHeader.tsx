import { Nav, Navbar } from 'react-bootstrap';
import { Calendar, Gear, Triangle, Wallet } from 'react-bootstrap-icons';
import { Link } from 'react-router-dom';
import WalletConnectionWidget from '../walletConnectionWidget/WalletConnectionWidget';
import './SiteHeader.css';

export default function SiteHeader() {

  return (
    <Navbar expand="lg" className='header mb-5'>
      <Navbar.Brand className='flex-grow-1'>
          <div className="header__logo">
            <Link to="/"><img src="./img/rogue_logo.svg" alt="ROGUE Logo - Mint NFTs Fast" /></Link>
          </div>
      </Navbar.Brand>
      <Navbar.Toggle aria-controls="basic-navbar-nav" />
      <Navbar.Collapse id="basic-navbar-nav" className='flex-grow-0'>
        <Nav className="me-auto" variant="pills" >
          <Link to="/wallets"><Wallet /><span>Wallets</span></Link>
          <Link to="/mint"><Triangle /><span>Mint</span></Link>
          <Link to="/tasks"><Calendar /><span>Tasks</span></Link>
          <Link to="/settings" className='mr-3'><Gear /><span>Settings</span></Link>
        </Nav>
        <WalletConnectionWidget />
      </Navbar.Collapse>
    </Navbar>
  )
}
