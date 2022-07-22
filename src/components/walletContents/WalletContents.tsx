import React, { } from 'react'
import './WalletContents.css'
import { IWallet } from '../../application-state/walletStore/WalletInterface'
import { BoxArrowUpRight, XSquare } from 'react-bootstrap-icons'
import { ROGUE_SESSION_ADDRESS } from '../../application-state/userContext/UserContextProvider'
import SimpleCrypto from 'simple-crypto-js'
import { useWalletStore } from '../../application-state/walletStore/WalletStore'

export interface WalletContentsProps {
  wallet : IWallet
  idx: number
}

function WalletContents({wallet, idx}: WalletContentsProps) {  
  const {deleteWallet}  = useWalletStore()
  function exportPrivateKey() {
    const sig = window.sessionStorage.getItem(ROGUE_SESSION_ADDRESS)
    const simpleCrypto = new SimpleCrypto(sig)
    console.log(simpleCrypto.decrypt(wallet.privateKey).toString())
  }

  function deleteWalletClick() {
    // TODo add confiurmation
    //deleteWallet(wallet)
  }

  return (
    <div className='wallet-container mb-2'>
      <div className='d-flex wallet-container-header mb-2 align-items-baseline'>
        <div>Burner {idx+1}</div>
        <div className='flex-grow-1 text-secondary ms-3'>{wallet.name}</div>
        <div className='text-secondary'>{wallet.balance} ETH</div>
        <div  
          className='icon-button ms-2'
          onClick={exportPrivateKey}><BoxArrowUpRight /></div>
        <div  
          className='icon-button ms-2'
          onClick={deleteWalletClick}><XSquare /></div>
      </div>
      {/* <div>
        <Row className='g-3'>
          {wallet.contents 
          ? wallet.contents.map((x,i) => <WalletItem key={i} nft={x} />)
          : <></>
          }
        </Row>
      </div> */}
     

    </div>
  )
}

export default WalletContents
