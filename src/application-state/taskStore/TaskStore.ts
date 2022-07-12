import create from 'zustand'
import { ITask, ITaskState } from './TaskInterfaces'
import { getTasks, addTask, deleteTask, updateTask } from './TaskStoreLocal'


export const useTaskStore = create<ITaskState>()(
  (set) => ({
    tasks: getTasks(),
    addTask(task: ITask) {
      set((state) =>  ({tasks: addTask(task)}))
    },
    deleteTask(task: ITask) {
      set((state) => ({tasks: deleteTask(task)}))
    },
    updateTask(task: ITask) {
      set((state) => ({tasks: updateTask(task)}))
    }
  })
)
