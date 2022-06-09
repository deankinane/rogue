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
            <img src="./img/rogue_logo.svg" alt="ROGUE Logo - Mint NFTs Fast" />
            {/* <div className="header__logo__line"> ______  _____   ______ _     _ _______</div>
            <div className="header__logo__line">|_____/ |     | |  ____ |     | |______</div>
            <div className="header__logo__line">|    \_ |_____| |_____| |_____| |______</div>
            <div className="header__logo__line"> </div> */}
          </div>
      </Navbar.Brand>
      <Navbar.Toggle aria-controls="basic-navbar-nav" />
      <Navbar.Collapse id="basic-navbar-nav" className='flex-grow-0'>
        <Nav className="me-auto" variant="pills" >
          <Link to="/wallets"><Wallet />Wallets</Link>
          <Link to="/mint"><Triangle />Mint</Link>
          <Link to="/tasks"><Calendar />Tasks</Link>
          <Link to="/settings" className='mr-3'><Gear />Settings</Link>
        </Nav>
        <WalletConnectionWidget />
      </Navbar.Collapse>
    </Navbar>
  )
}
