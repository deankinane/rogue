import { LocalStore } from "../../entities/LocalStore"
import { ITask } from "./TaskInterfaces"

const ROGUE_STORAGE_TASKS = 'ROGUE_STORAGE_TASKS'
const TaskLocalStore = new LocalStore<ITask[]>(ROGUE_STORAGE_TASKS, [])

function getTasks(): ITask[] {
  return TaskLocalStore.getData()
}

function addTask(task:ITask): ITask[] {
  const updated = [...getTasks()]
  updated.push(task)
  TaskLocalStore.setData(updated)
  return updated
}

function deleteTask(task:ITask): ITask[] {
  const updated = [...getTasks()]
  const idx = updated.findIndex(x => x.id === task.id)
  updated.splice(idx, 1)
  TaskLocalStore.setData(updated)
  return updated
}

function updateTask(task: ITask): ITask[] {
  const updated = [...getTasks()]
  const idx = updated.findIndex(x => x.id === task.id)
  updated[idx] = task
  TaskLocalStore.setData(updated)
  return updated
}

export  {getTasks, addTask, deleteTask, updateTask}
