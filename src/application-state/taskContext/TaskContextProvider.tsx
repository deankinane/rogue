import React, { useState } from 'react'
import IPropsChildren from '../../common/IPropsChildren'
import useLocalStorage from '../../hooks/useLocalStorage'
import { ITask, ITaskState, TaskContext } from './TaskContext'

function TaskContextProvider({children}:IPropsChildren) {
  const ROGUE_STORAGE_TASKS = 'ROGUE_STORAGE_TASKS'
  const [taskStorage, setTaskStorage] = useLocalStorage<ITask[]>(ROGUE_STORAGE_TASKS, [])
  const [tasks, setTasks] = useState<ITask[]>(taskStorage)

  function addTask(task:ITask) {
    const updated = [...taskStorage]
    updated.push(task)
    setTaskStorage(updated)
    setTasks(t => (updated))
  }

  function deleteTask(taskIndex: number) {
    const updated = [...taskStorage]
    updated.splice(taskIndex, 1)
    setTaskStorage(updated)
    setTasks(t => (updated))
  }

  function updateTask(taskIndex: number, task: ITask) {
    const updated = [...taskStorage]
    updated[taskIndex] = task
    setTaskStorage(updated)
    setTasks(updated)
  }

  const taskState : ITaskState = {
    tasks: tasks,
    addTask: addTask,
    deleteTask: deleteTask,
    updateTask: updateTask
  } 
  
  
  return (
    <TaskContext.Provider value={taskState}>{children}</TaskContext.Provider>
  )
}

export default TaskContextProvider

