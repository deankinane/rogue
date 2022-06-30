import React, { PropsWithChildren, useEffect, useRef, useState } from 'react'
import { TransactionResponse, TransactionReceipt } from "@ethersproject/providers";
import './TransactionStatusWidget.css';
import { InputGroup, Spinner } from 'react-bootstrap';
import { CheckCircleFill, X } from 'react-bootstrap-icons';
import { ethers } from 'ethers';

export interface TransactionStatusWidgetProps extends PropsWithChildren<any> {
  transaction: Promise<TransactionResponse>
  group: number
  index: number
  callback: (group:number, index: number, rec?: TransactionReceipt) => void
}

enum TransactionState {
  Submitted = 'state-submitted',
  Pending = 'state-pending',
  Complete = 'state-complete',
  Failed = 'state-failed'
}

function TransactionStatusWidget({transaction, group, index, callback}:TransactionStatusWidgetProps) {
  const [response, setResponse] = useState<TransactionResponse>();
  const [receipt, setReceipt] = useState<TransactionReceipt>();
  const [status, setStatus] = useState(TransactionState.Submitted);
  const complete = useRef(false);

  useEffect(() => {
    setStatus(TransactionState.Submitted);
    transaction.then(r => {
      setResponse(r);
      setStatus(TransactionState.Pending);
      r.wait().then(rec => {
        if(complete.current) return;
        complete.current = true;
        setReceipt(rec);
        setStatus(TransactionState.Complete);
        callback(group, index, rec);
      })
      .catch(() => {
        // Check the transaction hasn't been replaced (sped up)
        if (r.hash === response?.hash) {
          if(complete.current) return;
          complete.current = true;
          setStatus(TransactionState.Failed);
          callback(group, index);
        }
      })
    });
    
  },[transaction]);

  return (
    <div className={`transaction-status-widget ${status}`}>
      <InputGroup>
        {status === TransactionState.Submitted ? <InputGroup.Text className='flex-grow-1'><Spinner animation="border" size="sm" className='me-3' />Submitting...</InputGroup.Text> : <></>}
        {status === TransactionState.Pending ? (
            <>
              <InputGroup.Text className={`flex-grow-1 ${status}`}><Spinner animation="border" size="sm" className='me-3'/>Pending...</InputGroup.Text>
              <InputGroup.Text>{`Nonce: ${response?.nonce}`}</InputGroup.Text>
            </>
        ) : <></>}
        {status === TransactionState.Complete ? (
            <>
              <InputGroup.Text className={`flex-grow-1 ${status}`}>
                <CheckCircleFill className='transaction-status-widget-icon me-2'/>
                Complete
              </InputGroup.Text>
              <InputGroup.Text>{`Nonce: ${response?.nonce}`}</InputGroup.Text>
              <InputGroup.Text>
                <a href={`https://etherscan.io/tx/${receipt?.transactionHash}`} target='_blank' rel='noreferrer'><img src='./img/etherscan-logo-light-circle.svg' alt='Etherscan link'/></a>
              </InputGroup.Text>
            </>
        ) : <></>}
        {status === TransactionState.Failed ? (
            <>
              <InputGroup.Text className={`flex-grow-1 ${status}`}><span className='transaction-status-widget-icon'><X /></span>Failed</InputGroup.Text>
              <InputGroup.Text>{receipt ? ethers.utils.formatEther(receipt?.effectiveGasPrice.mul(receipt?.gasUsed)) : ''}</InputGroup.Text>
            </>
        ) : <></>}
      </InputGroup>
    </div>
  )
}

export default TransactionStatusWidget
