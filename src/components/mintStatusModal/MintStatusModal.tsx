import React, { PropsWithChildren, useEffect, useRef, useState } from 'react'
import { Button, Col, FormControl, InputGroup, Modal, Row, Spinner } from 'react-bootstrap'
import { PendingTransactionGroup, sendTransactions, TransactionRequestGroup } from '../../entities/ProviderFunctions'
import TransactionStatusWidget from './transactionStatusWidget/TransactionStatusWidget'
import './MintStatusModal.css';
import getCurrentGas from '../../entities/GasNowApi';
import useRecursiveTimeout from '../../hooks/useRecursiveTimeout';
import {  LightningChargeFill } from 'react-bootstrap-icons';
import { TransactionState } from '../../entities/GlobalState';
import { BigNumber, ethers } from 'ethers';
import TransactionMonitorWidget, { TransactionCounts } from './transactionMonitorWidget/TransactionMonitorWidget';
import useNodeStorage from '../../hooks/useNodeStorage';
import { TransactionResponse, TransactionReceipt } from '@ethersproject/providers';

export interface MintStatusModalProps extends PropsWithChildren<any> {
  show: boolean
  onHide: () => void
  transactionRequestGroups: TransactionRequestGroup[],
  pendingTransactionGroups: PendingTransactionGroup[],
  settings: TransactionState
}

interface GasDistributionLevels {
  _50: number
  _75: number
  _90: number
  _99: number
}

function MintStatusModal({show, onHide, transactionRequestGroups, pendingTransactionGroups, settings}:MintStatusModalProps) {
  const [gwei, setGwei] = useState(0);
  const [newGas, setNewGas] = useState(0);
  const [pendingTransactions, setPendingTransactions] = useState(new Array<PendingTransactionGroup>());
  const [resubmitting, setResubmitting] = useState(false);
  const [complete, setComplete] = useState(false);
  const [provider, setProvider] = useState<ethers.providers.WebSocketProvider>();
  const [node] = useNodeStorage();
  const gasThreshold = useRef(BigNumber.from(0));
  const [txnCounts, setTxnCounts] = useState<TransactionCounts>({
    complete: 0,
    failed: 0,
    higherGas: 0,
    total: 0
  });
  const [transactionCount, setTransactionCount] = useState(0);
  const completeCount = useRef(0);
  const failedCount = useRef(0);
  const gasDistribution = useRef(new Array<number>());
  const gasDistUpdateInterval = useRef<NodeJS.Timer>();
  const [gasDistLevels, setGasDistLevels] = useState<GasDistributionLevels>({
    _50: 0,
    _75 :0,
    _90: 0,
    _99: 0
  });

  useEffect(() => {
    if(settings.maxGasFee) {
      setNewGas(Math.ceil(settings.maxGasFee * 1.5))
      gasThreshold.current = ethers.utils.parseUnits(`${settings.maxGasFee}`, 'gwei');
    }
    setTransactionCount((settings.selectedWallets?.length || 0) * (settings.transactionsPerWallet || 0));
  },[settings])

  useEffect(() => {
    setPendingTransactions(pendingTransactionGroups);
  },[pendingTransactionGroups])

  function onShown() {
    if(!node) return; //TODO something better
    if(node.wssUrl.startsWith('ws')) {
      const prov = new ethers.providers.WebSocketProvider(node.wssUrl);
      prov.on('pending', (tx) => {
        prov.getTransaction(tx).then((txn) => analyseTransaction(txn));
      });

      setProvider(prov);
      
      gasDistUpdateInterval.current = setInterval(() => {
        const sorted = gasDistribution.current.slice();
        sorted.sort((x,y) => x-y);

        const _99 = Math.min(Math.ceil(sorted.length * 0.99), sorted.length-1)
        const _90 = Math.min(Math.ceil(sorted.length * 0.90), sorted.length-1)
        const _75 = Math.min(Math.ceil(sorted.length * 0.75), sorted.length-1)
        const _50 = Math.min(Math.ceil(sorted.length * 0.50), sorted.length-1)
        const dist = {
          _50: sorted[_50]+1,
          _75: sorted[_75]+1,
          _90: sorted[_90]+1,
          _99: sorted[_99]+1,
        };
        setGasDistLevels(dist);

        console.log(sorted);
        console.log(dist);
        console.log('--------------');
      },2000)
    }
    
    setComplete(false);
  }

  function closeModal() {
    resetState();
    onHide();
  }


  function analyseTransaction(txn: TransactionResponse) {
  
    if(txn && txn.to === settings.contractAddress) {
      setTxnCounts(c => { c.total++; return c; });
      if(txn.maxPriorityFeePerGas) {
        gasDistribution.current.push(parseInt(ethers.utils.formatUnits(txn.maxPriorityFeePerGas, 'gwei')));

        if( txn.maxPriorityFeePerGas > gasThreshold.current) {
          setTxnCounts(c => { c.higherGas++; return c; });
        }
      }
    }
    
  }

  useRecursiveTimeout(async() => {
    const gasprice = await getCurrentGas();
    setGwei(gasprice.gas);
  }, 2000);

  async function speedUpTransactions() {
    if(!node) return //TODO something beter
    setResubmitting(true);
    transactionRequestGroups.forEach(g => {
      g.transactions.forEach(t => {
        t.maxFeePerGas = ethers.utils.parseUnits(`${newGas}`, 'gwei')
        t.maxPriorityFeePerGas = ethers.utils.parseUnits(`${newGas}`, 'gwei')
      })
    });

    try {
      const resent = await sendTransactions(transactionRequestGroups, node);
      setPendingTransactions(resent);
    } catch (error) {
      // TODO display message that they couldn't be resent as already being processed
    }
    
    setResubmitting(false);
  }

  function resetState() {
    if(provider) {
      provider.removeAllListeners('pending');
    }

    clearInterval(gasDistUpdateInterval.current);
    setPendingTransactions(new Array<PendingTransactionGroup>());
    setComplete(false);
    completeCount.current = 0;
    failedCount.current = 0;
    gasDistribution.current = new Array<number>();
  }
  
  function onTxnComplete(rec?: TransactionReceipt) {
    if(rec) {
      completeCount.current++;
    }
    else{
      failedCount.current++;
    }

    if (completeCount.current+failedCount.current === transactionCount) {
      setComplete(true);
      if(provider) {
        provider.removeAllListeners('pending');
      }
      clearInterval(gasDistUpdateInterval.current);
      console.log('stopped')
    }
  }

  return (
    <Modal
      show={show}
      onShow={onShown}
      size='lg'
      backdrop='static'
      centered
    >
      <Modal.Header>
        <Modal.Title>
          {complete ? 'Minting Complete' : 'Minting in Progress'}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div>
          <TransactionMonitorWidget counts={txnCounts} />
          <Row>
            <Col>
              <InputGroup className='mb-3 justify-content-end'>
                <InputGroup.Text>
                  <img className='gas-widget__icon' alt="gas-icon" src='./img/gas-pump.svg' />
                  <span className='gas-widget__gwei ms-2'>{gwei}</span>
                </InputGroup.Text>
                <InputGroup.Text>50%</InputGroup.Text>
                <Button variant='info' onClick={() => setNewGas(gasDistLevels._50)}>{gasDistLevels._50>0 ? gasDistLevels._50 : '?'} gwei</Button>
                <InputGroup.Text>75%</InputGroup.Text>
                <Button variant='info' onClick={() => setNewGas(gasDistLevels._75)}>{gasDistLevels._75>0 ? gasDistLevels._75 : '?'} gwei</Button>
                <InputGroup.Text>90%</InputGroup.Text>
                <Button variant='info' onClick={() => setNewGas(gasDistLevels._90)}>{gasDistLevels._90>0 ? gasDistLevels._90 : '?'} gwei</Button>
                <InputGroup.Text>99%</InputGroup.Text>
                <Button variant='info' onClick={() => setNewGas(gasDistLevels._99)}>{gasDistLevels._99>0 ? gasDistLevels._99 : '?'} gwei</Button>
                <FormControl 
                  type='number' 
                  step={5}
                  className='gas-widget__input'
                  value={newGas}
                  onChange={v => setNewGas(parseInt(v.currentTarget.value))}
                />
                <Button variant='success' onClick={speedUpTransactions}>{resubmitting ? <Spinner size='sm' animation={'border'} /> : <><LightningChargeFill /> Speed Up</>}</Button>
              </InputGroup>
            </Col>
          </Row>
          
        </div>
        <div>
          {pendingTransactions.map((g,i) => (
            <div key={i} className='mint-status-modal__wallet-container'>
              <div className="mint-status-modal__wallet-container__title d-flex">
                <p className='mb-0'>{g.wallet.name} - {g.wallet.publicKey.substring(0,6)}</p>
                <p className='text-end flex-grow-1 mb-0'>{`${g.wallet.balance} ETH`}</p>
              </div>
              <Row className='g-2 p-2'>
                {g.transactions.map((t,j) => (
                  <Col xs={6} key={j}><TransactionStatusWidget transaction={t} callback={onTxnComplete} /></Col>
                ))}
              </Row>
            </div>
            
          ))}
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button variant='info' className='float-end' onClick={closeModal}>Close</Button>
      </Modal.Footer>
    </Modal>
  )
}

export default MintStatusModal
