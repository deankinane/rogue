import { BigNumber, Contract, ethers, Signer } from "ethers";
import { Interface } from "ethers/lib/utils";
import SimpleCrypto from "simple-crypto-js";
import { INodeRecord } from "../application-state/settingsStore/ISettingsState";
import { ROGUE_SESSION_ADDRESS } from "../application-state/userContext/UserContextProvider";
import { INft, IWallet } from "../application-state/walletStore/WalletInterface";
import { ethersWallet, init, list } from '@x2y2-io/sdk'
import { Network } from '@x2y2-io/sdk/dist/network'
import { TransactionResponse } from "@ethersproject/providers";

const API_BASE_URL = 'https://api.x2y2.org/v1/'
const API_KEY = '3d4f4985-06ed-4a63-9855-a26443d06aa2'

async function setApprovalForAll(wallet: IWallet, collection: string, node: INodeRecord, maxFee: number, priorityFee: number): Promise<TransactionResponse> {

  const provider = new ethers.providers.JsonRpcProvider(node.rpcUrl)
  const sig = window.sessionStorage.getItem(ROGUE_SESSION_ADDRESS);
  const simpleCrypto = new SimpleCrypto(sig);
  const etherWallet = new ethers.Wallet(simpleCrypto.decrypt(wallet.privateKey).toString(), provider);

  const abi = new Interface(['function setApprovalForAll(address operator, bool _approved) external'])
  const contract = new Contract(collection, abi, etherWallet)

  const gas = await contract.estimateGas.setApprovalForAll('0xF849de01B080aDC3A814FaBE1E2087475cF2E354', true)

  const tx = await contract.setApprovalForAll('0xF849de01B080aDC3A814FaBE1E2087475cF2E354', true, {
    gasLimit: gas,
    maxFeePerGas: ethers.utils.parseUnits(`${maxFee}`, 'gwei'),
    maxPriorityFeePerGas: ethers.utils.parseUnits(`${priorityFee}`, 'gwei')
  })
  
  return tx
}

async function estimateGasForApproval(wallet: IWallet, collection: string, node: INodeRecord): Promise<number> {
  const provider = new ethers.providers.JsonRpcProvider(node.rpcUrl)
  const sig = window.sessionStorage.getItem(ROGUE_SESSION_ADDRESS);
  const simpleCrypto = new SimpleCrypto(sig);
  const etherWallet = new ethers.Wallet(simpleCrypto.decrypt(wallet.privateKey).toString(), provider);

  const abi = new Interface(['function setApprovalForAll(address operator, bool _approved) external'])
  const contract = new Contract(collection, abi, etherWallet)

  const gas = await contract.estimateGas.setApprovalForAll('0xF849de01B080aDC3A814FaBE1E2087475cF2E354', true)
  return parseInt(ethers.utils.formatUnits(gas, 'wei'))
}

async function isApprovedForAll(wallet: IWallet, collection: string, node: INodeRecord): Promise<boolean> {
  
  const provider = new ethers.providers.JsonRpcProvider(node.rpcUrl)
  const sig = window.sessionStorage.getItem(ROGUE_SESSION_ADDRESS);
  const simpleCrypto = new SimpleCrypto(sig);
  const etherWallet = new ethers.Wallet(simpleCrypto.decrypt(wallet.privateKey).toString(), provider);

  const abi = new Interface(['function isApprovedForAll(address owner, address operator) public view returns (bool)'])
  const contract = new Contract(collection, abi, etherWallet)

  const approved = await contract.isApprovedForAll(wallet.publicKey, '0xF849de01B080aDC3A814FaBE1E2087475cF2E354')
  return approved
}

async function listToken(token: INft, wallet:IWallet, price:number, listingLengthHours: number) {
  init('3d4f4985-06ed-4a63-9855-a26443d06aa2')
  const sig = window.sessionStorage.getItem(ROGUE_SESSION_ADDRESS);
  const simpleCrypto = new SimpleCrypto(sig);

  const network: Network = 'mainnet'
  const signer: Signer = ethersWallet(simpleCrypto.decrypt(wallet.privateKey).toString(), network)
  const expTime = Math.floor(new Date().getTime() / 1000) + (listingLengthHours*6000)

  await list({
    network: network,
    signer: signer, // Signer of the seller
    tokenAddress: token.collection.address, // string, contract address of NFT collection
    tokenId: token.tokenId, // string, token ID of the NFT
    price: ethers.utils.parseEther(`${price}`).toString(), // string, sale price in wei eg. '1000000000000000000' for 1 ETH
    expirationTime:  expTime // number, the unix timestamp when the listing will expire, in seconds. Must be at least 15 minutes later in the future.
  })
  
}

export {setApprovalForAll, isApprovedForAll, estimateGasForApproval, listToken}
