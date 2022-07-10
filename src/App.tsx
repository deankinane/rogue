import React, { useContext, useEffect, useState } from 'react';
import MintForm from './app/mintPage/MintPage';
import LeftPanel from './app/leftPanel/LeftPanel';
import { Toast, ToastContainer } from 'react-bootstrap';
import './App.css';
import { AlertMessage } from './hooks/useToast';
import SettingsContextProvider from './application-state/settingsContext/SettingsContextProvider';
import { UserContext } from './application-state/userContext/UserContext';
import HomePage from './app/homePage/HomePage';
import RightPanel from './app/rightPanel/RightPanel';
import WalletContextProvider from './application-state/walletContext/WalletContextProvider';
import TaskContextProvider from './application-state/taskContext/TaskContextProvider';
import TaskRunner from './components/taskRunner/TaskRunner';

function App() {
  const [toast, setToast] = useState<AlertMessage>();
  const {user} = useContext(UserContext)

  useEffect(() => {
    window.addEventListener('rogue_toast', displayToast);

    return () => {
      window.removeEventListener('rogue_toast', displayToast);
    }
  })

  const displayToast = (e:Event) => {
    const c = e as CustomEvent;
    setToast(c.detail);
  }

  return (
    <>
    {
      user.connected && user.licenced
      ? <>
          <SettingsContextProvider>    
            <WalletContextProvider>
              <TaskContextProvider>
                <div className='d-flex h-100'>
                  <LeftPanel />
                  <MintForm />
                  <RightPanel />
                </div>
                <TaskRunner />
              </TaskContextProvider>
            </WalletContextProvider>
          </SettingsContextProvider>
        </>
      : <HomePage />
    }
     
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
