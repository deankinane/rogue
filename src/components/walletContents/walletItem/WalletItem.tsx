import React, { useContext, useEffect, useState } from 'react'
import { Button } from 'react-bootstrap'
import { ArchiveFill, EyeSlashFill } from 'react-bootstrap-icons'
import { INft } from '../../../application-state/walletStore/WalletInterface'
import { useWalletStore } from '../../../application-state/walletStore/WalletStore'
import ConfirmationDialog from '../../confrimationDialog/ConfirmationDialog'
import './WalletItem.css'

export interface WalletItemProps {
  nft: INft
  disableControls?: boolean
}

function WalletItem({nft, disableControls}:WalletItemProps) {
  const {hideCollection} = useWalletStore()

  const [image, setImage] = useState('')
  const [hover, setHover] = useState(false)
  const [showModal, setShowModal] = useState(false)
  
  useEffect(() => {
    if(nft)
      setImage(nft.image)
  }, [nft])

  function onMouseEnter() {
    if (!disableControls)
      setHover(true)
  }

  function onMouseLeave() {
    if (!disableControls)
      setHover(false)
  }

  function confirmHideCollection() {
    hideCollection(nft.collection.address)
    setShowModal(false)
  }

  return (
    nft.collection.hidden 
    ? <></>
    :
    <>
    
    <div className='wallet-item m-2' onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave}>
      <div className='wallet-item-img'>
        {
          disableControls ? <></> :
          <div className={'wallet-item-overlay d-flex justify-content-center' + (hover ? ' hover' : '')}>
            <Button 
              onClick={() => setShowModal(true)}
              variant='secondary' 
              title='Hide Collection' 
              className='me-2'><EyeSlashFill /></Button>
            <Button variant='secondary' title='Consolidate'><ArchiveFill /></Button>
          </div>
        }
        
        <img src={image} alt={nft.name} className={hover ? 'hover' : ''} />
      </div>
      <div className='wallet-item-content'>
        <p className='wallet-item-content__collection'>{nft.collection.name}</p>
        <p className='wallet-item-content__name'># {nft.tokenId}</p>
      </div>
    </div>
    
    <ConfirmationDialog 
      show={showModal}
      title={`Hide ${nft.collection.name}`}
      message='Hide this collection from view across all wallets?'
      confirmButtonText='Hide'
      confirmCallback={confirmHideCollection}
      onHide={() => setShowModal(false)}
      />
    
    </>
  )
}

export default WalletItem
