import { ethers } from 'ethers';
import React, { useEffect, useRef, useState } from 'react'
import IPropsChildren from '../../common/IPropsChildren'
import { checkIfLicenced } from '../../entities/LicenceFunctions';
import useToast from '../../hooks/useToast';
import { defaultUserInfo, IUserState, UserContext } from './UserContext'

export const ROGUE_SESSION_ADDRESS = 'ROGUE_SESSION_ADDRESS';

function UserContextProvider({children}:IPropsChildren) {
  const sendToast = useToast()
  const checkedForConnection = useRef(false)
  const [connectedUser, setConnectedUser] = useState(defaultUserInfo)

  async function connectUser(): Promise<boolean> {
    const provider = new ethers.providers.Web3Provider(window.ethereum)
    const newUser = {...defaultUserInfo}

    const accounts = await provider.send("eth_requestAccounts", [])
    if (accounts && accounts.length >= 1) {
      newUser.address = accounts[0]
      newUser.connected = true
      window.sessionStorage.setItem(ROGUE_SESSION_ADDRESS, newUser.address)
      newUser.licenced = await signInUser(newUser.address)
      setConnectedUser(u => (newUser))
      return true
    }

    return false
  }

  async function signInUser(address: string): Promise<boolean> {

    const provider = new ethers.providers.Web3Provider(window.ethereum)
    if(await checkIfLicenced())  {
      const signer = provider.getSigner(address)
      try {
        await signer.signMessage("Rogue - Sign In")
        return true;
      } catch (error) {
        sendToast('Sign in Failed', 'User cancelled the request', 'info')
      }
    }

    return false;
  }

  async function checkIsUserConnected() {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const newUser = {...defaultUserInfo}
    const accounts = await provider.send("eth_accounts", []);
    if (accounts && accounts.length >= 1) {
      newUser.address = accounts[0]
      newUser.connected = true
      setConnectedUser(u => (newUser))
      const licenced = await signInUser(newUser.address)
      window.sessionStorage.setItem(ROGUE_SESSION_ADDRESS, newUser.address)
      setConnectedUser(u => ({...u, licenced: licenced}))
    }
  }

  useEffect(() => {
    if(!checkedForConnection.current){
      checkedForConnection.current = true
      checkIsUserConnected()
    }
  },[])

  const userState: IUserState = {
    user: connectedUser,
    connectUser: connectUser
  }

  return (
    <UserContext.Provider value={userState}>{children}</UserContext.Provider>
  
  )
}

export default UserContextProvider
