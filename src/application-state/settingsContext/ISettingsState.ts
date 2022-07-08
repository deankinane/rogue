export interface INodeRecord {
  rpcUrl: string
  chainId: number
}

export interface ISettings {
  node: INodeRecord
}

export default interface ISettingsState {
  settings: ISettings
  updateSettings: (settings: ISettings) => void
}

export const defaultSettings: ISettings = {
  node:{
    chainId: 1,
    rpcUrl: ''
  }
}
