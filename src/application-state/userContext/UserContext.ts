import { createContext } from "react"

export interface IUserInfo {
  connected: boolean
  address: string
  chainId: number
  licenced: boolean
}

export interface IUserState {
  user: IUserInfo
  connectUser: () => Promise<boolean>
}

export const defaultUserInfo: IUserInfo = {
  connected: false,
  address: '',
  chainId: 1,
  licenced: false
}

export const UserContext = createContext<IUserState>({
  user: defaultUserInfo,
  connectUser: async () => {return false}
})

