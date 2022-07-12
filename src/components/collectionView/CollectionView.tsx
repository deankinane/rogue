import React, {  useState } from 'react'
import { Button, Row } from 'react-bootstrap'
import { CaretDownFill, CaretUpFill } from 'react-bootstrap-icons'
import { ICollectionView } from '../../application-state/walletStore/WalletInterface'
import WalletItem from '../walletContents/walletItem/WalletItem'
import './CollectionView.css'

export interface CollectionViewProps {
  collectionView: ICollectionView
}
function CollectionView({collectionView}: CollectionViewProps) {
  const [collapsed, setCollapsed] = useState(true)

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
          {collectionView.collection.name}
        </div>
        <div className='collection-view__details'>
          {collectionView.tokens.length} items
        </div>
        <Button 
          variant='dark'
          className='m-3'
          onClick={() => setCollapsed(x => (!x))}>{collapsed ? <CaretDownFill />: <CaretUpFill />}</Button>
      </div>
      <div className={`collection-view__collapse mb-3 ${collapsed ? '' : 'expanded'}`}>
        <Row className='g-3'>
          {
            collectionView.tokens.map((x,i) => <WalletItem key={i} nft={x} />)
          }
        </Row>
      </div>
    </>
  )
}

export default CollectionView
