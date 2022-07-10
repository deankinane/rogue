import Blocknative from 'bnc-sdk';
import { EthereumTransactionData } from 'bnc-sdk/dist/types/src/interfaces';
import React, { useEffect, useRef } from 'react'
import { ITask, TriggerType, useTaskContext } from '../../application-state/taskContext/TaskContext'
import { BLOCKNATIVE_APPID } from '../../entities/constants';

function TaskRunner() {
  const blocknative = useRef<Blocknative>();
  const {tasks, updateTask} = useTaskContext()

  useEffect(() => {
    blocknative.current = new Blocknative({
      dappId: BLOCKNATIVE_APPID,
      networkId: 4,
      onerror: e => console.log('error', e)
    });

  },[])

  useEffect(()=> {
  
    
    tasks.forEach(t => {
      if (t.type === TriggerType.flipstate) {
        console.log('setup')
        setUpFlipStateTask(t)
      }
    })
    
    return () => {
      tasks.forEach(t => {
        if (t.type === TriggerType.flipstate) {
          console.log('teardown')
          tearDownFlipStatetask(t)
        }
      })
    }
  }, [tasks])

  function setUpFlipStateTask(t: ITask) {
    if (!blocknative.current) {
      // TODO possibly throw error
      return
    }

    const account = blocknative.current.account(t.contract.address)
    account.emitter.on("txPool", txn => {

      const txnData = txn as EthereumTransactionData;
      console.log(txnData.input)
      console.log(t.settings.triggerFunction)
      if (txnData && txnData.input.startsWith(t.settings.triggerFunction)) {
        console.log('Flip state detected')
      }
    })
  }

  function tearDownFlipStatetask(t: ITask) {
    if (blocknative.current) {
      blocknative.current.unsubscribe(t.contract.address)
    }
  }

  return (
    <div></div>
  )
}

export default TaskRunner


