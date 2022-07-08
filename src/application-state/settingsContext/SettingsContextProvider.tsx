import React, { useEffect, useState } from 'react'
import IPropsChildren from '../../common/IPropsChildren';
import useLocalStorage from '../../hooks/useLocalStorage';
import ISettingState, { defaultSettings, ISettings } from './ISettingsState';
import { SettingsContext } from './SettingsContext';

function SettingsContextProvider({children}:IPropsChildren) {
  const ROGUE_STORAGE_SETTINGS = 'ROGUE_STORAGE_SETTINGS';
  const [storedSettings, setStoredSettings] = useLocalStorage<ISettings>(ROGUE_STORAGE_SETTINGS, defaultSettings);
  const [settings, setSettings] = useState<ISettings>(defaultSettings)

  useEffect(() => {
    setSettings(storedSettings || defaultSettings)
  },[])

  function updateSettings(settings:ISettings) {
    setSettings(s => {
      const updated = {...s, ...settings}
      setStoredSettings(updated)
      return updated
    })
  }

  const settingsState: ISettingState = {
    settings: settings || defaultSettings,
    updateSettings: updateSettings
  }
  return (
    <SettingsContext.Provider value={settingsState}>{children}</SettingsContext.Provider>
  )
}

export default SettingsContextProvider
