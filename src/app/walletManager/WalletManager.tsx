import React, { useContext, useState } from 'react'
import { Button } from 'react-bootstrap'
import { PlusCircleFill, WalletFill } from 'react-bootstrap-icons';
import { WalletContext } from '../../application-state/walletContext/WalletContext';
import AddWalletModal from '../../components/addWalletModal/AddWalletModal';
import WalletContents from '../../components/walletContents/WalletContents';
import IWalletRecord from '../../entities/IWalletRecord';
import './WalletManager.css';

// export interface WalletManagerProps {
//   wallets: IWalletRecord[],
//   onUpdateWallets: (wallets:IWalletRecord[]) => void
//   filterHiddenCollections: () => void
// }
function WalletManager() {
  const [addWalletModalVisible, setAddWalletModalVisible] = useState(false);

  const {wallets, addWallet} = useContext(WalletContext);

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
      <div className="d-flex mb-4 dark-panel-section-header">
        <h5 className='fw-bold mb-0 flex-grow-1'><WalletFill className='me-3'/>Manage Wallets</h5>
        <Button 
          variant='info' 
          onClick={onAddWalletClick}
          className='mb-4'>
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
