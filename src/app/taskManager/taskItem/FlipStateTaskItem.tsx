import Blocknative from 'bnc-sdk'
import { EthereumTransactionData } from 'bnc-sdk/dist/types/src/interfaces'
import React, { useEffect, useRef, useState } from 'react'
import { Button, Spinner } from 'react-bootstrap'
import { ArrowRightShort, CaretDownFill, CaretUpFill, Check, X } from 'react-bootstrap-icons'
import { useSettingsStore } from '../../../application-state/settingsStore/SettingsStore'
import { ITask, TaskStatus } from '../../../application-state/taskStore/TaskInterfaces'
import { useTaskStore } from '../../../application-state/taskStore/TaskStore'
import { ITransactionGroup, TransactionStatus } from '../../../common/ITransaction'
import { BLOCKNATIVE_APPID } from '../../../entities/constants'
import { sendTransactionGroups, prepareTransactionGroups } from '../../../entities/ProviderFunctions'
import TaskItemProps from './TaskItemProps'

function FlipStateTaskItem({task}:TaskItemProps) {
  const {deleteTask, updateTask} = useTaskStore()
  const {settings} = useSettingsStore()
  const [collapsed, setCollapsed] = useState(true)
  const [transactionGroups, setTransactionGroups] = useState<ITransactionGroup[]>([])

  const blocknative = useRef<Blocknative>(
    new Blocknative({
      dappId: BLOCKNATIVE_APPID,
      networkId: 4,
      onerror: e => console.log('error', e)
    })
  )

  useEffect(() => {
    if(task.status === TaskStatus.waiting && transactionGroups.length === 0) {
      createTransactionGroups()  
    }

    const client = blocknative.current;
    const account = client.account(task.contract.address)
    console.log('subscribed', task.contract.address)
    account.emitter.on("txPool", txn => {
      console.log('txn detected')
      const txnData = txn as any;
      
      if (txnData && txnData.input.startsWith(task.settings.triggerFunction)) {        
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
    console.log(groups)
    setTransactionGroups(g => [...groups])
  }

  async function run(maxFeePerGas: string, maxPriorityFeePerGas: string) {
    console.log(transactionGroups)

    if (transactionGroups.length === 0) return

    task.status = TaskStatus.running
    updateTask(task)
    const groups = await sendTransactionGroups(transactionGroups, settings.node, maxFeePerGas, maxPriorityFeePerGas)
    groups.forEach((g,i) => {
      g.transactions.forEach((t,j) => {
        if (t.promise)
          t.promise.then(res => {
            console.log('wating for response')
            t.response = res
            res.wait().then(rec => {
              console.log(rec)
              t.receipt = rec
              t.status = TransactionStatus.complete
              setTransactionGroups(tg => {
                tg[i].transactions[j] = t
                return tg
              })
            })
            .catch((e) => {
              console.log(e)
              t.status = TransactionStatus.failed
              setTransactionGroups(tg => {
                tg[i].transactions[j] = t
                return tg
              })
            })
          })
          .catch((e) => {
            console.log(e)
            t.status = TransactionStatus.failed
            setTransactionGroups(tg => {
              tg[i].transactions[j] = t
              return tg
            })
          })
      })
    })

    setTransactionGroups(groups)
    setCollapsed(false)
  }

  return (
    <div className='task-item'>
      <div className='d-flex align-items-center'>
        <div className='task-item__logo me-3'><img src={task.contract.contractLogo} alt=''/></div>
        <div className='flex-grow-1'>
          <div className='task-item__title'>{task.contract.contractName}</div>
          <div className='d-flex align-items-center'>
            <Spinner animation="grow" size="sm" className='me-2'/>
            <div className='task-item__type'>{task.type} </div>
            <ArrowRightShort className='me-1 task-item__arrow' />
            <div className='task-item__status me-1'>{task.status}</div>
          </div>
        </div>
        
        <Button variant='info' onClick={() =>  deleteTask(task)}>Cancel</Button>
        {/* <div>{task.transactionSettings.selectedWallets.length} wallets</div>
        <div>{task.transactionSettings.transactionsPerWallet * task.transactionSettings.selectedWallets.length} txns</div> */}
        {
          task.status === TaskStatus.waiting
          ? <Button variant='info' onClick={() =>  deleteTask(task)}>Cancel</Button>
          : <Button 
              variant='dark'
              className='m-3'
              onClick={() => setCollapsed(x => (!x))}>{collapsed ? <CaretDownFill />: <CaretUpFill />}</Button>
        }
      </div>
      <div className={`task-item__txns ${collapsed ? '' : 'mt-3 expanded'}`}>
        {
          transactionGroups.map((g,i) => (
            <div className='task-item__txns__group' key={i}>
              <div>
                <p className='task-item__txns__group__title'>{g.wallet.name}</p>
              </div>
              <div className='task-item__txns__group__tnxs'>
              {
                g.transactions.map((t,i) => (
                  <div key={i} className={`task-item__pending-txn txn-state-${t.status}`}>
                    {t.status === TransactionStatus.pending ? <Spinner animation='border' size='sm' /> : <></> }
                    {t.status === TransactionStatus.complete ? <Check /> : <></> }
                    {t.status === TransactionStatus.failed ? <X /> : <></> }
                  </div> 
                ))
              }
              </div>
            </div>
          ))
        }
        
        {/* <div className='task-item__txns__group'>
          <div>
            <p className='task-item__txns__group__title'>Burner 1</p>
          </div>
          <div className='task-item__txns__group__tnxs'>
            <div className='task-item__pending-txn txn-state-1'><Spinner animation='border' size='sm' /></div>
            <div className='task-item__pending-txn txn-state-1'></div>
            <div className='task-item__pending-txn txn-state-2'><Check /></div>
            <div className='task-item__pending-txn txn-state-2'></div>
            <div className='task-item__pending-txn txn-state-3'><X/></div>
            <div className='task-item__pending-txn txn-state-1'><Spinner animation='border' size='sm' /></div>
            <div className='task-item__pending-txn txn-state-1'></div>
            <div className='task-item__pending-txn txn-state-2'><Check /></div>
            <div className='task-item__pending-txn txn-state-2'></div>
            <div className='task-item__pending-txn txn-state-3'><X/></div>
          </div>
        </div> */}
        
       
      </div>
    </div>
  )
}

export default FlipStateTaskItem
