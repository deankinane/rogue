import React, { useEffect, useRef, useState } from 'react'
import { Button, ButtonGroup } from 'react-bootstrap'
import { BoxArrowInDownLeft, PlusCircleFill, WalletFill } from 'react-bootstrap-icons';
import { IWallet } from '../../application-state/walletStore/WalletInterface';
import { useWalletStore } from '../../application-state/walletStore/WalletStore';
import AddWalletModal from './addWalletModal/AddWalletModal';
import WalletContents from '../../components/walletContents/WalletContents';
import './WalletManager.css';
import CreateWalletsModal from './createWalletsModal/CreateWalletsModal';
import DisperseEtherWidget from './disperseEtherWidget/DisperseEtherWidget';

function WalletManager() {
  const [createWalletModalVisible, setCreateWalletModalVisible] = useState(false);
  const [addWalletModalVisible, setAddWalletModalVisible] = useState(false);
  const {wallets, addWallet, updateWalletContents, updateWalletBalances} = useWalletStore()
  const intitialLoad = useRef(true)

  useEffect(() => {
    if (intitialLoad.current) {
      intitialLoad.current = false
      updateWalletContents().then(() => updateWalletBalances())
    }
  },[])

  function onAddWalletClick() {
    setAddWalletModalVisible(true);
  }

  function onCreateWalletClick() {
    setCreateWalletModalVisible(true);
  }

  function onAddWalletCallback(wallet?: IWallet) {
    setAddWalletModalVisible(false);
    if(wallet){
      addWallet(wallet)
    }
  }
  
  function onCreateWalletsCallback() {
    setCreateWalletModalVisible(false)
  }


  return (
    <div className='p-1'>
      <div className="d-flex pb-4 mb-4 right-panel__section-header">
        <h5 className='fw-bold flex-grow-1'><WalletFill className='me-3'/>Manage Wallets</h5>
        <ButtonGroup>
          <Button 
            variant='info' 
            onClick={onCreateWalletClick}
            >
              <PlusCircleFill className='me-2'/> Create Wallets
          </Button>
          <Button 
            variant='info' 
            onClick={onAddWalletClick}
            title='Import Existing Wallet'
            >
              <BoxArrowInDownLeft />
          </Button>
        </ButtonGroup>
      </div>
      
      {wallets.map((x,i) => <WalletContents key={i} wallet={x} idx={i} />)}

      <AddWalletModal 
        show={addWalletModalVisible} 
        callback={onAddWalletCallback}  
      />

      <CreateWalletsModal 
        show={createWalletModalVisible} 
        close={onCreateWalletsCallback}
      />
    </div>
    
  )
}

export default WalletManager
