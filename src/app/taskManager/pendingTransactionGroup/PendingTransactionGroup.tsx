import React, { useState } from 'react'
import { ITransactionGroup, TransactionStatus } from '../../../common/ITransaction'
import PendingTransaction from './PendingTransaction'

export interface PendingTransactionGroupProps {
  group: ITransactionGroup
  index: number
  onGroupComplete: (index: number, results: Array<number>) => void
}
function PendingTransactionGroup({group, index, onGroupComplete}:PendingTransactionGroupProps) {
  const [txnStates, setTxnStates] = useState<boolean[]>(new Array<boolean>(group.transactions.length))
  const [results, setResults] = useState(new Array<number>(group.transactions.length))

  function onTransactionResolved(idx:number, result: TransactionStatus) {
    txnStates[idx] = true
    results[idx] = result
    if (txnStates.findIndex(x => x !== true) < 0) {
      onGroupComplete(index, results)
    }
    setResults(r => [...results])
    setTxnStates(s => [...txnStates])
  }

  return (
    <div className='task-item__txns__group'>
      <div>
        <p className='task-item__txns__group__title'>{group.wallet.name}</p>
      </div>
      <div className='task-item__txns__group__tnxs'>
      {
        group.transactions.map((t,i) => (
          <PendingTransaction promise={t.promise} index={i} onTransactionResolved={onTransactionResolved} key={i} />
        ))
      }
      </div>
    </div>
  )
}

export default PendingTransactionGroup
