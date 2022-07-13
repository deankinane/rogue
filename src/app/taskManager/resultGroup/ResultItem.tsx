import React from 'react'
import { Spinner } from 'react-bootstrap'
import { Check, X } from 'react-bootstrap-icons'
import { TransactionStatus } from '../../../common/ITransaction'
interface ResultItemProps {
  result: number
}
function ResultItem({result}: ResultItemProps) {
  return (
    <div className={`task-item__pending-txn txn-state-${result}`}>
      {result === TransactionStatus.pending || result === 0 ? <Spinner animation='border' size='sm' /> : <></> }
      {result === TransactionStatus.complete ? <Check /> : <></> }
      {result === TransactionStatus.failed ? <X /> : <></> }
    </div> 
  )
}

export default ResultItem
