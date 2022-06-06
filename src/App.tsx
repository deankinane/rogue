import React from 'react';
import MintForm from './app/mintPage/MintPage';
import SiteHeader from './components/siteHeader/SiteHeader';
import { Col, Container, Row } from 'react-bootstrap';
import {  Route, Routes } from 'react-router-dom';
import WalletPage from './app/walletPage/WalletPage';
import './App.css';


function App() {

  return (
    <>
      <Container fluid className='p-0'>
        <div className='header-wrapper'>
          <SiteHeader/>
        </div>
        
      </Container>
  
      <Container className='flex-grow-1 d-flex flex-column'>
        <Routes>
          <Route path="/wallets" element={<WalletPage />} />
          <Route path="/mint" element={<MintForm />} />
          <Route path="/tasks"element={<div/>} />
          <Route path="/settings"element={<div/>} />
        </Routes>
      </Container>
    </>
  );
}

export default App;
