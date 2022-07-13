import React from 'react'
import { IGroupResult } from '../../../application-state/taskStore/TaskInterfaces'
import ResultItem from './ResultItem'

interface ResultGroupProps {
  groupResults: IGroupResult
}
function ResultGroup({groupResults}: ResultGroupProps) {
  return (
    <div className='task-item__txns__group'>
      <div>
        <p className='task-item__txns__group__title'>{groupResults.name}</p>
      </div>
      <div className='task-item__txns__group__tnxs'>
      {
        groupResults.results.map((t,i) => (
          <ResultItem result={t} key={i} />
        ))
      }
      </div>
    </div>
  )
}

export default ResultGroup
