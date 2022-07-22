import Blocknative from 'bnc-sdk'
import React, { useEffect, useRef, useState } from 'react'
import { Button, Spinner } from 'react-bootstrap'
import { ArrowRightShort, CaretDownFill, CaretRightFill, CaretUpFill, CheckSquareFill } from 'react-bootstrap-icons'
import { useSettingsStore } from '../../../application-state/settingsStore/SettingsStore'
import { IGroupResult, TaskStatus } from '../../../application-state/taskStore/TaskInterfaces'
import { useTaskStore } from '../../../application-state/taskStore/TaskStore'
import { ITransactionGroup } from '../../../common/ITransaction'
import { BLOCKNATIVE_APPID } from '../../../entities/constants'
import { sendTransactionGroups, prepareTransactionGroups } from '../../../entities/ProviderFunctions'
import PendingTransactionGroup from '../pendingTransactionGroup/PendingTransactionGroup'
import ResultGroup from '../resultGroup/ResultGroup'
import TaskItemProps from './TaskItemProps'

function FlipStateTaskItem({task}:TaskItemProps) {
  const {deleteTask, updateTask} = useTaskStore()
  const {settings} = useSettingsStore()
  const [collapsed, setCollapsed] = useState(true)
  const [transactionGroups, setTransactionGroups] = useState<ITransactionGroup[]>([])
  const [groupStates, setGroupStates] = useState<boolean[]>([])
  const transactionGroupsRef = useRef<ITransactionGroup[]>([])
  const blocknative = useRef<Blocknative>(
    new Blocknative({
      dappId: BLOCKNATIVE_APPID,
      networkId: 1,
      onerror: e => console.log('error', e)
    })
  )

  useEffect(() => {
    if(task.status !== TaskStatus.waiting) {
      return;
    }

    createTransactionGroups()

    const client = blocknative.current;
    const account = client.account(task.contract.address)
    console.log('subscribed', task.contract.address)
    account.emitter.on("txPool", txn => {
      console.log('txn detected')
      const txnData = txn as any;
      
      if (txnData && txnData.input.startsWith(task.settings.triggerFunction) && txnData.from === task.settings.caller) {     
        task.status = TaskStatus.running
        updateTask(task)
        run(txnData.maxFeePerGas, txnData.maxPriorityFeePerGas)
      }
    })

    return () => {
      console.log('unsubscribe')
      client.unsubscribe(task.contract.address)
    }
  },[task])

  async function createTransactionGroups() {
    const groups = await prepareTransactionGroups(task.contract, task.transactionSettings, settings.node)
    transactionGroupsRef.current = groups
    console.log(groups)
  }

  async function run(maxFeePerGas: string, maxPriorityFeePerGas: string) {
    console.log(transactionGroupsRef.current)

    if (transactionGroupsRef.current.length === 0) return

    task.status = TaskStatus.running
    updateTask(task)
    transactionGroupsRef.current = await sendTransactionGroups(transactionGroupsRef.current, settings.node, maxFeePerGas, maxPriorityFeePerGas)
    setTransactionGroups(transactionGroupsRef.current)
    console.log(transactionGroupsRef.current)
    setCollapsed(false)
    console.log('unsubscribe')
    blocknative.current.unsubscribe(task.contract.address)
  }

  function onGroupComplete(index: number, results:number[]) {
    groupStates[index] = true
    if (!task.results) task.results = new Array<IGroupResult>(transactionGroupsRef.current.length)
    task.results[index] = {
      name: transactionGroupsRef.current[index].wallet.name,
      results: results
    }

    if (!groupStates.find(x => x === false)) {
      task.status = TaskStatus.complete
    }
    updateTask(task)
    setGroupStates(s => [...groupStates])
  }

  return (
    <div className='task-item'>
      <div className='d-flex align-items-center'>
        <div className='task-item__logo me-3'><img src={task.contract.contractLogo} alt=''/></div>
        <div className='flex-grow-1'>
          <div className='task-item__title'>{task.contract.contractName}</div>
          <div className='d-flex align-items-center'>
            {task.status === TaskStatus.waiting ? <Spinner animation="grow" size="sm" className='me-2'/> : <></> }
            {task.status === TaskStatus.running ? <Spinner animation="border" size="sm" className='me-2'/> : <></> }
            {task.status === TaskStatus.complete ? <CheckSquareFill className='me-2' /> : <></> }
            <div className='task-item__type'>{task.type} </div>
            <ArrowRightShort className='me-1 task-item__arrow' />
            <div className={`task-item__status me-1 task-item__status-${task.status}`}>{task.status}</div>
          </div>
        </div>
        <div className='task-item__details'>
          {task.transactionSettings.selectedWallets.length} wallets
          <CaretRightFill />
          {task.transactionSettings.transactionsPerWallet * task.transactionSettings.selectedWallets.length * task.transactionSettings.unitsPerTxn} mints
        </div>
        
        
        {
          task.status === TaskStatus.complete ? <Button variant='info' onClick={() =>  deleteTask(task)}>Dismiss</Button> : <></>
        }
        {
          task.status === TaskStatus.waiting
          ? <Button variant='info' onClick={() =>  deleteTask(task)}>Cancel</Button>
          : <Button 
              variant='dark'
              className='ms-3'
              onClick={() => setCollapsed(x => (!x))}>{collapsed ? <CaretDownFill />: <CaretUpFill />}</Button>
        }
      </div>
      <div className={`task-item__txns ${collapsed ? '' : 'mt-3 expanded'}`}>
        { task.status !== TaskStatus.complete ?
          transactionGroups.map((g,i) => (
            <PendingTransactionGroup group={g} onGroupComplete={onGroupComplete} index={i} key={i} />
          ))
          :
          task.results?.map((r,i) => <ResultGroup groupResults={r} key={i} />)
        }
        
      </div>
    </div>
  )
}

export default FlipStateTaskItem
