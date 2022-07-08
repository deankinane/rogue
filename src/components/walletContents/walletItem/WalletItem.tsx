import React, { useEffect, useState } from 'react'
import { Button } from 'react-bootstrap'
import { ArchiveFill, EyeSlashFill } from 'react-bootstrap-icons'
import { NFT } from '../../../entities/IWalletRecord'
import useHiddenCollections from '../../../hooks/useHiddenCollections'
import ConfirmationDialog from '../../confrimationDialog/ConfirmationDialog'
import './WalletItem.css'

export interface WalletItemProps {
  nft: NFT
  filterHiddenCollections: () => void
}

function WalletItem({nft, filterHiddenCollections}:WalletItemProps) {
  const [image, setImage] = useState('')
  const [hover, setHover] = useState(false)
  const [showModal, setShowModal] = useState(false)

  const [hidden, setHidden] = useHiddenCollections()

  useEffect(() => {
    if(nft)
      setImage(nft.image)
  }, [nft])

  function onMouseEnter() {
    setHover(true)
  }

  function onMouseLeave() {
    setHover(false)
  }

  function confirmHideCollection() {
    hidden.push(nft.collection.address)
    setHidden(hidden)
    setShowModal(false)
    filterHiddenCollections()
  }

  return (
    <>
    
    <div className='wallet-item' onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave}>
      <div className='wallet-item-img'>
        <div className={'wallet-item-overlay d-flex justify-content-center' + (hover ? ' hover' : '')}>
          <Button 
            onClick={() => setShowModal(true)}
            variant='secondary' 
            title='Hide Collection' 
            className='me-2'><EyeSlashFill /></Button>
          <Button variant='secondary' title='Consolidate'><ArchiveFill /></Button>
        </div>
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
