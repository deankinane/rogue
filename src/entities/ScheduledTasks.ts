import { FunctionFragment } from "ethers/lib/utils";

export enum TriggerType {
  backrun = 'backrun',
  value = 'value',
  time = 'time'
}

export interface BackrunTriggerSettings {
  triggerFunction: FunctionFragment
}
