import React from 'react-bootstrap'
import { Calendar2DateFill } from 'react-bootstrap-icons'
import { useTaskStore } from '../../application-state/taskStore/TaskStore'
import TaskItem from './taskItem/TaskItem'

function TaskManager() {
  const {tasks} = useTaskStore()

  return (
    <>
    <div className='p-1'>
      <div className='d-flex mb-4 right-panel__section-header'>
        <h5 className='fw-bold mb-4 flex-grow-1'><Calendar2DateFill className='me-3'/>Manage Tasks</h5>
      </div>
    </div>
    {
      tasks.map((t,i) => (
        <TaskItem key={i} task={t} />
      ))
    }
    </>
  )
}

export default TaskManager
