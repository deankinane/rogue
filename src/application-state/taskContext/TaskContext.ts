import { FunctionFragment } from "ethers/lib/utils";
import { createContext, useContext } from "react";
import { defaultTransactionState, TransactionState } from "../../entities/GlobalState";
import MintContract from "../../entities/MintContract";

export enum TriggerType {
  flipstate = 'Flipstate',
  value = 'Value',
  time = 'Time'
}

export enum TaskStatus {
  waiting = 'Waiting',
  triggered = 'Triggered',
  running = 'Running',
  complete = 'Complete',
  failed = 'Failed'
}

export interface IFlipstateTriggerSettings {
  triggerFunction: string
}

export interface ITask {
  contract: MintContract
  type: TriggerType
  settings: IFlipstateTriggerSettings
  transactionSettings: TransactionState
  status: TaskStatus
}

export const defaultTask: ITask = {
  contract: new MintContract(''),
  type: TriggerType.flipstate,
  settings: {
    triggerFunction: ''
  },
  status: TaskStatus.waiting,
  transactionSettings: defaultTransactionState
}

export interface ITaskState {
  tasks: ITask[]
  addTask: (task: ITask) => void
  deleteTask: (taskIndex: number) => void
  updateTask: (taskIndex: number, task: ITask) => void
}

export const TaskContext = createContext<ITaskState>({
  tasks: [],
  addTask: (task: ITask) => {},
  deleteTask: (taskIndex: number) => {},
  updateTask: (taskIndex: number, task: ITask) => {}
})

export const useTaskContext = () => useContext(TaskContext)
