import { createContext } from "react"
import ISettingsState, { defaultSettings, ISettings } from "./ISettingsState"

export const SettingsContext = createContext<ISettingsState>({
  settings: defaultSettings,
  updateSettings: (settings: ISettings) => {}
})
