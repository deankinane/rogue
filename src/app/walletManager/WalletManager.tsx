import React, { useContext, useEffect, useRef, useState } from 'react'
import { Button } from 'react-bootstrap'
import { PlusCircleFill, WalletFill } from 'react-bootstrap-icons';
import { IWalletRecord, WalletContext } from '../../application-state/walletContext/WalletContext';
import AddWalletModal from '../../components/addWalletModal/AddWalletModal';
import WalletContents from '../../components/walletContents/WalletContents';
import './WalletManager.css';

function WalletManager() {
  const [addWalletModalVisible, setAddWalletModalVisible] = useState(false);
  const {wallets, addWallet, updateWalletContents, updateWalletBalances} = useContext(WalletContext);
  const intitialLoad = useRef(true)

  useEffect(() => {
    if (intitialLoad.current) {
      intitialLoad.current = false
      updateWalletContents()
      updateWalletBalances()
    }
  },[])

  function onAddWalletClick() {
    setAddWalletModalVisible(true);
  }

  function onAddWalletCallback(wallet?: IWalletRecord) {
    setAddWalletModalVisible(false);
    if(wallet){
      addWallet(wallet)
    }
  }
  
  // function onDeleteWallet(wallet: IWalletRecord) {

  //   setWalletList(walletList.filter(x => x.name !== wallet.name))
  //   setWallets(walletList.filter(x => x.name !== wallet.name));
  // }

  return (
    <div className='p-1'>
      <div className="d-flex pb-4 mb-4 right-panel__section-header">
        <h5 className='fw-bold flex-grow-1'><WalletFill className='me-3'/>Manage Wallets</h5>
        <Button 
          variant='info' 
          onClick={onAddWalletClick}
          >
            <PlusCircleFill className='me-2'/> Add Wallet
        </Button>
      </div>
      {wallets.map((x,i) => <WalletContents key={i} wallet={x} />)}

      <AddWalletModal 
        show={addWalletModalVisible} 
        callback={onAddWalletCallback}  
      />
    </div>
    
  )
}

export default WalletManager
