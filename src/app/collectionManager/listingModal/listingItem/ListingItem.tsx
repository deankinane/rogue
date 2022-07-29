import React from 'react'
import { Col, Form } from 'react-bootstrap'
import { INft, IWallet } from '../../../../application-state/walletStore/WalletInterface'
import './ListingItem.css'

interface ListingItemProps {
  item: ListItem
  onSelectedChanged: (selected:boolean) => void
  onPriceChanged: (price: number) => void
}

export interface ListItem {
  token: INft
  wallet: IWallet
  price: number
  selected: boolean
}

function ListingItem({item, onSelectedChanged, onPriceChanged}: ListingItemProps) {
  
  return (
    <Col xs={1}>
      <div className={`listing-item ${item.selected ? 'selected' : ''}`}>
        <div className='listing-item-img' onClick={() => onSelectedChanged(!item.selected)}>
          <img src={item.token.image} alt={item.token.name}/>
        </div>
        <div className='listing-item-content'>
          # {item.token.tokenId}
          <Form.Control 
            className='listing-item_price-field'
            type='number'
            value={item.price}
            disabled={!item.selected}
            onChange={p => onPriceChanged(parseFloat(p.currentTarget.value))}
            />
        </div>
      </div>
    </Col>
    
  )
}

export default ListingItem
