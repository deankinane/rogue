import create from 'zustand'
import ISettingsState, { ISettings } from './ISettingsState'
import { getSettings, updateSettings } from './SettingsStoreLocal'

export const useSettingsStore = create<ISettingsState>()(
  (set) => ({
    settings: getSettings(),
    updateSettings(settings: ISettings) {
      updateSettings(settings)
      set((state) => ({settings: getSettings()}))
    }
  })
)
