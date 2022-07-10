import React, { useContext } from 'react'
import { CollectionFill } from 'react-bootstrap-icons'
import { WalletContext } from '../../application-state/walletContext/WalletContext'
import CollectionView from '../../components/collectionView/CollectionView'

function CollectionManager() {
  const {collections} = useContext(WalletContext)

  return (
    <>
    <div className='p-1'>
      <div className='d-flex mb-4 right-panel__section-header'>
        <h5 className='fw-bold mb-4 flex-grow-1'><CollectionFill className='me-3'/>Manage Collections</h5>
      </div>
    </div>
    {
      collections.map((c,i) => (
        <CollectionView collectionView={c} key={i} toggleKey={`col${i}`} />
      ))
    }
    
    </>
    
  )
}

export default CollectionManager
