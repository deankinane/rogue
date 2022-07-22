import { ethers } from "ethers";

export function getFunctionNameHex(name: string): string {
  if (name === '') return ''
  
  return ethers.utils.keccak256(ethers.utils.toUtf8Bytes(`${name.replace('()', '')}()`)).substring(0,10)
}
