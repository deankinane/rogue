import { LocalStore } from "../../entities/LocalStore";
import { defaultSettings, ISettings } from "./ISettingsState";

// const ROGUE_STORAGE_SETTINGS = 'ROGUE_STORAGE_SETTINGS';
const ROGUE_STORAGE_SETTINGS = 'ROGUE_STORAGE_SETTINGS_TESTNET';
const settingsStoreLocal = new LocalStore<ISettings>(ROGUE_STORAGE_SETTINGS, defaultSettings)

function getSettings() {
  return settingsStoreLocal.getData()
}

function updateSettings(settings: ISettings) {
  settingsStoreLocal.setData({
    ...settingsStoreLocal.getData(),
    ...settings
  })
} 


export {getSettings, updateSettings}
