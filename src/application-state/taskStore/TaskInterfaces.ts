import { defaultTransactionState, TransactionState } from "../../entities/GlobalState"
import MintContract from "../../entities/MintContract"

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

export interface IGroupResult {
  name: string
  results: number[]
}

export interface ITask {
  id: string
  contract: MintContract
  type: TriggerType
  settings: IFlipstateTriggerSettings
  transactionSettings: TransactionState
  status: TaskStatus,
  results?: IGroupResult[]
}

export const defaultTask: ITask = {
  id: '',
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
  deleteTask: (task: ITask) => void
  updateTask: (task: ITask) => void
}
