import React from 'react'
import { CollectionFill } from 'react-bootstrap-icons'
import { useWalletStore } from '../../application-state/walletStore/WalletStore'
import CollectionView from '../../components/collectionView/CollectionView'

function CollectionManager() {
  const {collections} = useWalletStore()

  return (
    <>
    <div className='p-1'>
      <div className='d-flex mb-4 right-panel__section-header'>
        <h5 className='fw-bold mb-4 flex-grow-1'><CollectionFill className='me-3'/>Manage Collections</h5>
      </div>
    </div>
    {
      collections.map((c,i) => (
        <CollectionView collectionView={c} key={i} />
      ))
    }
    
    </>
    
  )
}

export default CollectionManager
