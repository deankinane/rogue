import React from 'react'
import { TriggerType } from '../../../application-state/taskStore/TaskInterfaces'
import FlipStateTaskItem from './FlipStateTaskItem'
import TaskItemProps from './TaskItemProps'
import './TaskItem.css'

function TaskItem({task}:TaskItemProps) {
  function getTaskItem() {
    switch(task.type) {
      case TriggerType.flipstate:
        return <FlipStateTaskItem task={task} />
        
      default:
        return <FlipStateTaskItem task={task} />
    }
  }
  return getTaskItem()
}

export default TaskItem
