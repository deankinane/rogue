import React, { FormEvent, useState } from 'react'
import { ModalProps, Modal, Form, Button, Spinner, Row, FormControl, InputGroup } from 'react-bootstrap'
import { useSettingsStore } from '../../../application-state/settingsStore/SettingsStore';
import { ICollectionView, IWallet } from '../../../application-state/walletStore/WalletInterface';
import { useWalletStore } from '../../../application-state/walletStore/WalletStore';
import { getFloorPrice } from '../../../entities/IcyApi';
import { listToken } from '../../../entities/X2Y2';
import ApprovalWidget from './approvalWidget/ApprovalWidget';
import ListingItem, { ListItem } from './listingItem/ListingItem';
import './ListingModal.css'

interface ListingModalProps extends ModalProps {
  collection: ICollectionView
  callback: () => void
}

function ListingModal({callback, collection, ...props}: ListingModalProps) {
  const [working, setWorking] = useState(false);
  const {wallets} = useWalletStore()
  const {settings} = useSettingsStore()
  const [opening, setOpening] = useState(false)
  const [collectionWallets, setCollectionWallets] = useState<IWallet[]>([])
  const [approvalsNeeded, setApprovalsNeeded] = useState(true)
  const [items, setItems] = useState<ListItem[]>([])
  const [lowPrice, setLowPrice] = useState(0.01)
  const [highPrice, setHighPrice] = useState(0.1)
  const [selectedCount, setSelectedCount] = useState(0)
  const [floorPrice, setFloorPrice] = useState(0)
  const [listingLength, _setListingLength] = useState(12)
  const [currentItem, setCurrentItem] = useState(0)

  function onModalOpened() {
    const addresses = wallets.filter(w => (
        w.contents.findIndex(n => n.collection.address === collection.collection.address) > -1
      ))
      setCollectionWallets(x => addresses)
      setItems(collection.tokens.map<ListItem>(t => ({token: t, price: 0, selected: false, wallet: wallets.find(w => w.contents.findIndex(n => n.tokenId === t.tokenId) > -1) as any})))
      setSelectedCount(0)
      setOpening(true)
      updateFloorPrice()
  }

  function setListingLength(val: string) {
    // if (val === '') _setListingLength(0.1)
    // else _setListingLength(parseFloat(val))
    _setListingLength(parseFloat(val))
  }

  async function updateFloorPrice() {
    const floor = await getFloorPrice(collection.collection.address)
    setLowPrice(x => floor)
    setHighPrice(x => floor*2)
    setFloorPrice(floor)
  }

  function onModalClosing() {    
    callback()
  }

  async function onListButtonClicked(e: FormEvent) {
    setWorking(true)
    e.preventDefault()

    for (let i = 0; i < items.length; i++) {
      if (items[i].selected) {
        setCurrentItem(i => i+1)
        await listToken(items[i].token, items[i].wallet, items[i].price, listingLength)
      }
    }

    setWorking(false)
  }

  function onItemSelectionChanged(item: ListItem, selected: boolean) {
    const newItems = [...items]
    const idx = newItems.findIndex(x => x.token.tokenId === item.token.tokenId)
    newItems[idx].selected = selected
    setItems(x => newItems)
    setSelectedCount(x => newItems.filter(i => i.selected).length)
  }

  function onItemPriceChanged(item: ListItem, price: number) {
    const newItems = [...items]
    const idx = newItems.findIndex(x => x.token.tokenId === item.token.tokenId)
    newItems[idx].price = price
    setItems(x => newItems)
  }

  function onApplyClick() {
    if (highPrice<lowPrice) {
      return
    }
    const selCount = items.filter(x => x.selected).length
    const step = (highPrice-lowPrice)/(selCount-1)

    const newItems = [...items]
    let assigned = 0;
    let nextPrice = lowPrice
    for (let i = 0; i < newItems.length; i++) {
      if (!newItems[i].selected) continue
      
      if(assigned === 0) newItems[i].price = lowPrice
      else if (assigned === selCount-1) newItems[i].price = highPrice
      else newItems[i].price = parseFloat(nextPrice.toFixed(4))

      assigned++
      nextPrice+=step
    }

    setItems(x => newItems)
  }

  function onSelectAll() {
    const newItems = [...items]
    newItems.forEach(i => i.selected = true)
    setItems(x => newItems)
    setSelectedCount(newItems.length)
  }

  function onSelectHalf() {
    const newItems = [...items]
    const half = Math.floor(newItems.length / 2)
    newItems.forEach((n,i) => n.selected = i<half)
    setItems(x => newItems)
    setSelectedCount(newItems.length)
  }

  function onSelectNone() {
    const newItems = [...items]
    newItems.forEach(i => i.selected = false)
    setItems(x => newItems)
    setSelectedCount(0)
  }

  return (
    <Modal
      {...props}
      centered
      backdrop='static'
      keyboard={false}
      size='lg'
      onHide={onModalClosing}
      onShow={onModalOpened}
      className='listing-modal'
    >
      <Modal.Header closeButton>
        <Modal.Title className='listing-modal-title d-flex'>
          <img src={collection.collection.logo} alt='Collection logo' className='me-3' />
          <div>
            <p>{collection.collection.name}</p>
            <p className='listing-modal-title__subtitle'>List Items for Sale</p>
          </div>
        </Modal.Title>
      </Modal.Header>
      <Form onSubmit={onListButtonClicked}>
      <Modal.Body>
        {
          approvalsNeeded ? 
            <ApprovalWidget 
            address={collection.collection.address} 
            init={opening} 
            initCallback={() => setOpening(false)} 
            onAllApproved={() => setApprovalsNeeded(false)}
            wallets={collectionWallets}
            /> 
          : <></>
        }
     {
      !approvalsNeeded ? 
      <div>
        <p className='mb-2 fw-normal'>Price Range</p>
        <div className='d-flex align-items-baseline mb-4'>
          
          <InputGroup className='listing-price-group me-2'>
            <InputGroup.Text>
              Floor Price
            </InputGroup.Text>
            <InputGroup.Text className='fw-bold'>
              {floorPrice}
            </InputGroup.Text>
          </InputGroup>
          <InputGroup className='listing-price-group me-2'>
            <InputGroup.Text>
              Low
            </InputGroup.Text>
            <FormControl 
              className='listing-price-input'
              type='number' 
              min={0}
              step={0.0001}
              value={lowPrice}
              onChange={v => setLowPrice(parseFloat(v.currentTarget.value))}
              />
          </InputGroup>

          <InputGroup className='listing-price-group me-2'>
            <InputGroup.Text>
              High
            </InputGroup.Text>
            <FormControl 
              className='listing-price-input'
              type='number' 
              min={0}
              step={0.0001}
              value={highPrice}
              onChange={v => setHighPrice(parseFloat(v.currentTarget.value))}
              />
          </InputGroup>
          <InputGroup className='listing-price-group me-3'>
            <Button variant='info' onClick={onApplyClick}>Apply</Button>
          </InputGroup>
          
        </div>
        <div className='d-flex mb-3'>
          <p className='flex-grow-1 mb-0 fw-normal'>Select Items to List</p>
          <Button variant='action' className='me-2' onClick={onSelectAll}>Select All</Button>
          <Button variant='action' className='me-2' onClick={onSelectHalf}>Select Half</Button>
          <Button variant='action' onClick={onSelectNone}>Select None</Button>
        </div>
        
        <Row className='g-2'>
          {
            items.map((x,i) => <ListingItem 
                                  key={i} 
                                  item={x} 
                                  onSelectedChanged={v => onItemSelectionChanged(x, v)}
                                  onPriceChanged={p => onItemPriceChanged(x,p)}/>)
          }
        </Row>
        <div className='d-flex justify-content-end mt-3'>
          <InputGroup className='listing-price-group'>
              <InputGroup.Text>
                Listing Length
              </InputGroup.Text>
              <FormControl 
                className='listing-price-input'
                type='number' 
                min={0}
                max={9999}
                step={1}
                value={listingLength}
                onChange={e => setListingLength(e.currentTarget.value)}
                />
                <InputGroup.Text>
                  hours
                </InputGroup.Text>
          </InputGroup>
        </div>
        
      </div>
      : <></>
     }

      </Modal.Body>
      <Modal.Footer>
        {
          working ?
          <p className='text-muted me-3'>`Listing item {currentItem} of {selectedCount}...`</p>
          : <p className='text-muted me-3'>{selectedCount} items selected</p>
        }
        <Button 
          type='submit' 
          variant='success' 
          style={{'width': '160px'}}
          disabled={working || approvalsNeeded || selectedCount === 0}
          >
            {working ? <Spinner size='sm' animation="border" /> : 'List Items on X2Y2'}
          </Button>
      </Modal.Footer>
      </Form>
    </Modal>
  )
}

export default ListingModal
