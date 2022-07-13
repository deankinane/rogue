import React, { useEffect, useState } from 'react'
import { Spinner } from 'react-bootstrap'
import { Check, X } from 'react-bootstrap-icons'
import { TransactionStatus } from '../../../common/ITransaction'
import { TransactionResponse } from "@ethersproject/abstract-provider";

export interface PendingTransactionProps {
  promise?: Promise<TransactionResponse>
  index: number
  onTransactionResolved: (index: number, result: TransactionStatus) => void
}
function PendingTransaction({promise, index, onTransactionResolved}:PendingTransactionProps) {
  const [status, setStatus] = useState(1)

  useEffect(() => {
    if(!promise) return

    promise.then(res => {
      res.wait().then(rec => {
        onTransactionResolved(index, TransactionStatus.complete)
        setStatus(s => (TransactionStatus.complete))
      })
      .catch((e) => {
        onTransactionResolved(index, TransactionStatus.failed)
        setStatus(s => (TransactionStatus.failed))
      })
    })
    .catch((e) => {
      onTransactionResolved(index, TransactionStatus.failed)
      setStatus(s => (TransactionStatus.failed))
    })
  },[promise]);

  return (
    <div className={`task-item__pending-txn txn-state-${status}`}>
      {status === TransactionStatus.pending || status === 0 ? <Spinner animation='border' size='sm' /> : <></> }
      {status === TransactionStatus.complete ? <Check /> : <></> }
      {status === TransactionStatus.failed ? <X /> : <></> }
    </div> 
  )
}

export default PendingTransaction
