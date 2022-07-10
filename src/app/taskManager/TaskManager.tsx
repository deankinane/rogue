import React, { Button } from 'react-bootstrap'
import { Calendar2DateFill } from 'react-bootstrap-icons'
import { useTaskContext } from '../../application-state/taskContext/TaskContext'

function TaskManager() {
  const {tasks, deleteTask} = useTaskContext()

  return (
    <>
    <div className='p-1'>
      <div className='d-flex mb-4 right-panel__section-header'>
        <h5 className='fw-bold mb-4 flex-grow-1'><Calendar2DateFill className='me-3'/>Manage Tasks</h5>
      </div>
    </div>
    {
      tasks.map((c,i) => (
        <div key={i}>{c.type} - {c.contract?.contractName} <Button onClick={() =>  deleteTask(i)}>Cancel</Button></div>
      ))
    }
    </>
  )
}

export default TaskManager
