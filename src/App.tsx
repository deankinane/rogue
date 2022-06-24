import React, { useEffect, useState } from 'react';
import MintForm from './app/mintPage/MintPage';
import SiteHeader from './components/siteHeader/SiteHeader';
import { Container, Toast, ToastContainer } from 'react-bootstrap';
import {  Route, Routes } from 'react-router-dom';
import WalletPage from './app/walletPage/WalletPage';
import './App.css';
import SettingsPage from './app/settingsPage/SettingsPage';
import HomePage from './app/homePage/HomePage';
import { AlertMessage } from './hooks/useToast';

function App() {
  const [toast, setToast] = useState<AlertMessage>();
  
  useEffect(() => {
    window.addEventListener('rogue_toast', displayToast);

    return () => {
      window.removeEventListener('rogue_toast', displayToast);
    }
  })

  const displayToast = (e:Event) => {
    const c = e as CustomEvent;
    console.log(c)
    setToast(c.detail);
  }

  return (
    <>
      <Container fluid className='p-0'>
        <div className='header-wrapper'>
          <SiteHeader/>
        </div>
      </Container>
  
      <div className='app-container flex-grow-1 d-flex flex-column p-4 pt-0'>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/wallets" element={<WalletPage />} />
          <Route path="/mint" element={<MintForm />} />
          <Route path="/tasks"element={<div/>} />
          <Route path="/settings"element={<SettingsPage />} />
          
        </Routes>
      </div>

      <ToastContainer className="p-3" position="top-end">
        {toast ? 
          <Toast autohide={toast.type !== "error"} delay={3000} className={`toast--${toast.type}`} onClose={() => setToast(undefined)}>
            <Toast.Header>
              <p className='mb-0 flex-grow-1 fw-bold'>{toast.title}</p>
            </Toast.Header>
            <Toast.Body>{toast.message}</Toast.Body>
          </Toast>
          : <></>
      }
      </ToastContainer>
    </>
  );
}

export default App;
