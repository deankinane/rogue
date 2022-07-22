import React, {  useState } from 'react'
import { Button, Row } from 'react-bootstrap'
import { CaretDownFill, CaretUpFill } from 'react-bootstrap-icons'
import { useSettingsStore } from '../../../application-state/settingsStore/SettingsStore'
import { ICollectionView } from '../../../application-state/walletStore/WalletInterface'
import { useWalletStore } from '../../../application-state/walletStore/WalletStore'
import { X2Y2Icon } from '../../../components/icons'

import WalletItem from '../../../components/walletContents/walletItem/WalletItem'
import ListingModal from '../listingModal/ListingModal'
import './CollectionView.css'

export interface CollectionViewProps {
  collectionView: ICollectionView
}
function CollectionView({collectionView}: CollectionViewProps) {
  const [collapsed, setCollapsed] = useState(true)
  const {wallets} = useWalletStore()
  const {settings} = useSettingsStore()
  const [showListingModal, setShowListingModal] = useState(false)

  function listForSale() {
    setShowListingModal(true)
  }

  return (
    collectionView.collection.hidden
    ? <></>
    : 
    <>
      <div className='collection-view mb-3'>
        <div className='collection-view__logo me-3'>
          <img src={collectionView.collection.logo} alt={`${collectionView.collection.name} logo`} />
        </div>
        <div className='collection-view__details flex-grow-1'>
          <div className='fw-bold'>{collectionView.collection.name}</div>
          <div className='text-secondary'>{collectionView.tokens.length} items</div>
        </div>
        <Button 
          variant='dark'
          onClick={listForSale}><X2Y2Icon className='me-2'/> List for Sale</Button>
        <Button 
          variant='dark'
          className='m-3'
          onClick={() => setCollapsed(x => (!x))}>{collapsed ? <CaretDownFill />: <CaretUpFill />}</Button>
      </div>
      <div className={`collection-view__collapse mb-3 ${collapsed ? '' : 'expanded'}`}>
        <Row className='g-0'>
          {
            collectionView.tokens.map((x,i) => <WalletItem key={i} nft={x} />)
          }
        </Row>
      </div>
      <ListingModal callback={() => {setShowListingModal(false)}} show={showListingModal} collection={collectionView} />
    </>
  )
}

export default CollectionView
