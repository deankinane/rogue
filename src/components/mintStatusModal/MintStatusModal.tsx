import React, { PropsWithChildren, useContext, useEffect, useRef, useState } from 'react'
import { Button, Col, FormControl, InputGroup, Modal, Row, Spinner } from 'react-bootstrap'
import { PendingTransactionGroup, sendTransaction, TransactionRequestGroup } from '../../entities/ProviderFunctions'
import TransactionStatusWidget from './transactionStatusWidget/TransactionStatusWidget'
import './MintStatusModal.css';
import getCurrentGas, { EthGasPrice } from '../../entities/GasNowApi';
import useRecursiveTimeout from '../../hooks/useRecursiveTimeout';
import { LightningChargeFill } from 'react-bootstrap-icons';
import { TransactionState } from '../../entities/GlobalState';
import { ethers } from 'ethers';
import { TransactionReceipt } from '@ethersproject/providers';
import Blocknative from 'bnc-sdk';
import { Emitter, EthereumTransactionData } from 'bnc-sdk/dist/types/src/interfaces';
import { BLOCKNATIVE_APPID } from '../../entities/constants';
import { useSettingsStore } from '../../application-state/settingsStore/SettingsStore';

export interface MintStatusModalProps extends PropsWithChildren<any> {
  show: boolean
  onHide: () => void
  transactionRequestGroups: TransactionRequestGroup[],
  pendingTransactionGroups: PendingTransactionGroup[],
  transactionState: TransactionState
}

interface GasDistributionLevels {
  _70: number
  _80: number
  _90: number
  _100: number
}

interface TxnGasSettings {
  max: number
  priority: number
}

function MintStatusModal({show, onHide, transactionRequestGroups, pendingTransactionGroups, transactionState}:MintStatusModalProps) {
  const [gwei, setGwei] = useState<EthGasPrice>({base:0, max:0});
  const [newGas, setNewGas] = useState(0);
  const [pendingTransactions, setPendingTransactions] = useState(new Array<PendingTransactionGroup>());
  const [resubmitting, setResubmitting] = useState(false);
  const [complete, setComplete] = useState(false);
  const {settings} = useSettingsStore()
  const [transactionCount, setTransactionCount] = useState(0);
  const completeCount = useRef(0);
  const failedCount = useRef(0);
  const gasDistribution = useRef(new Array<TxnGasSettings>());
  const gasDistUpdateInterval = useRef<NodeJS.Timer>();
  const [gasDistLevels, setGasDistLevels] = useState<GasDistributionLevels>({
    _70: 0,
    _80 :0,
    _90: 0,
    _100: 0
  });
  const blocknative = useRef<Blocknative>();
  const txnEmitter = useRef<Emitter>();
  const [effPrioFee, setEffPrioFee] = useState(0);
  const [currentlyBeating, setCurrentlyBeating] = useState(0);
  const importantTxnCount = useRef(0);

  useEffect(() => {
    if(transactionState.maxGasFee) {
      setNewGas(transactionState.maxGasFee)
    }
    setTransactionCount((transactionState.selectedWallets?.length || 0) * (transactionState.transactionsPerWallet || 0));
    const maxSupply = transactionState.maxSupply > 0 ? transactionState.maxSupply : 6000;
    importantTxnCount.current = Math.round(maxSupply / transactionState.unitsPerTxn);
  },[transactionState])

  useEffect(() => {
    setPendingTransactions(pendingTransactionGroups);
  },[pendingTransactionGroups])

  function onShown() {

    blocknative.current = new Blocknative({
      dappId: BLOCKNATIVE_APPID,
      networkId: 1,
      onerror: e => console.log('error', e)
    });

    const account = blocknative.current.account(transactionState.contractAddress)
    txnEmitter.current = account.emitter;

    txnEmitter.current.on("txPool", txn => {
      analyseTransaction(txn as EthereumTransactionData)
    })
    
    gasDistUpdateInterval.current = setInterval(updateGasProbabilityEstimates,2000)
    
    setComplete(false);
  }

  function updateGasProbabilityEstimates() {
    if(gasDistribution.current.length === 0) return;

    let sorted = gasDistribution.current.map(x => getEPF(x.max, x.priority))
    sorted.sort((x, y) => x - y);

    if (importantTxnCount.current > 0 && sorted.length > importantTxnCount.current) {
      sorted = sorted.slice(sorted.length - importantTxnCount.current);
    }

    const _100 = sorted.length-1;
    const _90 = Math.min(Math.ceil(sorted.length * 0.90), sorted.length - 1);
    const _80 = Math.min(Math.ceil(sorted.length * 0.80), sorted.length - 1);
    const _70 = Math.min(Math.ceil(sorted.length * 0.70), sorted.length - 1);

    const dist = {
      _70: Math.round(sorted[_70] + gwei.base + 1),
      _80: Math.round(sorted[_80] + gwei.base + 1),
      _90: Math.round(sorted[_90] + gwei.base + 1),
      _100: Math.round(sorted[_100] + gwei.base + 1)
    };
    setGasDistLevels(dist);

    const beating = sorted.filter(x => x < transactionState.maxGasFee);
    setCurrentlyBeating((beating.length/sorted.length)*100);
  }

  function getEPF(maxFee: number, maxPriorityFee: number){
    const feeOffset = maxFee - gwei.base;
    return Math.min(feeOffset, maxPriorityFee);
  }

  function closeModal() {
    resetState();
    onHide();
  }


  function analyseTransaction(txn: EthereumTransactionData) {
    
    if (txn.maxPriorityFeePerGasGwei && txn.maxFeePerGasGwei) {
      gasDistribution.current.push({
        max: txn.maxFeePerGasGwei,
        priority: txn.maxPriorityFeePerGasGwei
      });
    }
  }

  useRecursiveTimeout(async() => {
    const gasprice = await getCurrentGas();
    setGwei(gasprice);
    setEffPrioFee(transactionState.maxGasFee - gasprice.base);
  }, 2000);

  async function speedUpTransactions() {
    setResubmitting(true);

    for(let i=0; i<transactionRequestGroups.length; i++) {
      for(let j=0; j<transactionRequestGroups[i].transactions.length; j++) {
        if (pendingTransactions[i].resolved.indexOf(j) === -1) {
          transactionRequestGroups[i].transactions[j].maxFeePerGas = ethers.utils.parseUnits(`${newGas}`, 'gwei')
          transactionRequestGroups[i].transactions[j].maxPriorityFeePerGas = ethers.utils.parseUnits(`${newGas}`, 'gwei')
          try {
            pendingTransactions[i].transactions[j] = sendTransaction(transactionRequestGroups[i].transactions[j], transactionRequestGroups[i].wallet, settings.node)
          } catch (error) {
            // TODO display message that they couldn't be resent as already being processed
          }
        }
      }
    }
    
    setResubmitting(false);
  }

  function resetState() {
    txnEmitter.current?.off('txPool');
    blocknative.current?.unsubscribe(transactionState.contractAddress)

    clearInterval(gasDistUpdateInterval.current);
    setPendingTransactions(new Array<PendingTransactionGroup>());
    setComplete(false);
    completeCount.current = 0;
    failedCount.current = 0;
    gasDistribution.current = new Array<TxnGasSettings>();
  }
  
  function onTxnComplete(group:number, index: number, rec?: TransactionReceipt) {
    if(rec) {
      completeCount.current++;
    }
    else{
      failedCount.current++;
    }

    pendingTransactions[group].resolved.push(index);

    if (completeCount.current+failedCount.current === transactionCount) {
      setComplete(true);
      txnEmitter.current?.off('txPool');
      blocknative.current?.unsubscribe(transactionState.contractAddress)
      clearInterval(gasDistUpdateInterval.current);
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
          <Row>
            <Col>
            <div className='modal-section'>
              <div className="d-flex">
                <div className='flex-grow-1'>
                  <p className='modal-section__title mb-1'>Gas Optimizer</p>
                  <p className='modal-info-text'>Chance of success: {currentlyBeating}%</p>
                </div>
                <div>
                  <InputGroup className='mb-3' size='lg'>
                    <InputGroup.Text>
                      <img className='gas-widget__icon' alt="gas-icon" src='./img/gas-pump.svg' />
                      <span className='gas-widget__gwei ms-2'>Base: {gwei.base}</span>
                    </InputGroup.Text>
                    <InputGroup.Text>
                      
                      <span className='gas-widget__gwei ms-2'>Max: {transactionState.maxGasFee}</span>
                    </InputGroup.Text>
                    <InputGroup.Text>
                      
                      <span className='gas-widget__gwei ms-2'>EPF: {effPrioFee}</span>
                    </InputGroup.Text>
                  </InputGroup>
                </div>
              </div>
              
              <InputGroup className='justify-content-end'>
                <InputGroup.Text>Beat 70%</InputGroup.Text>
                <Button variant='info' onClick={() => setNewGas(gasDistLevels._70)}>{gasDistLevels._70>0 ? gasDistLevels._70 : '?'} gwei</Button>
                <InputGroup.Text>80%</InputGroup.Text>
                <Button variant='info' onClick={() => setNewGas(gasDistLevels._80)}>{gasDistLevels._80>0 ? gasDistLevels._80 : '?'} gwei</Button>
                <InputGroup.Text>90%</InputGroup.Text>
                <Button variant='info' onClick={() => setNewGas(gasDistLevels._90)}>{gasDistLevels._90>0 ? gasDistLevels._90 : '?'} gwei</Button>
                <InputGroup.Text>100%</InputGroup.Text>
                <Button variant='info' onClick={() => setNewGas(gasDistLevels._100)}>{gasDistLevels._100>0 ? gasDistLevels._100 : '?'} gwei</Button>
                <FormControl 
                  type='number' 
                  step={5}
                  className='gas-widget__input'
                  value={newGas}
                  onChange={v => setNewGas(parseInt(v.currentTarget.value))}
                />
                <Button variant='success' disabled={newGas <= transactionState.maxGasFee} onClick={speedUpTransactions}>{resubmitting ? <Spinner size='sm' animation={'border'} /> : <><LightningChargeFill /> Speed Up</>}</Button>
              </InputGroup>
            </div>

              
            </Col>
          </Row>
          
        </div>
        <div>
          {pendingTransactions.map((g,i) => (
            <div key={i} className='modal-section mt-3'>
              <div className="mint-status-modal__wallet-container__title d-flex">
                <p className='mb-3'>{g.wallet.name} - {g.wallet.publicKey.substring(0,6)}</p>
                <p className='text-end flex-grow-1 mb-0'>{`${g.wallet.balance} ETH`}</p>
              </div>
              <Row className='g-2'>
                {g.transactions.map((t,j) => (
                  <Col xs={12} md={6} lg={4} key={j}>
                    <TransactionStatusWidget transaction={t} group={i} index={j} callback={onTxnComplete} />
                  </Col>
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
