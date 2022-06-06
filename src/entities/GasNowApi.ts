import { BigNumber, ethers } from "ethers";

const URL: string = 'https://etherchain.org/api/gasnow';
export interface EthGasPrice {
  gas:number
  price:number
}

interface GasCache {
  updated: number,
  value: EthGasPrice
}

const gasCache: GasCache = {
  updated: 0,
  value: {gas:0, price:0}
}

async function getCurrentGas(): Promise<EthGasPrice> {
  if (+ new Date() - gasCache.updated < 2000) {
    return gasCache.value;
  }

  const resp = await fetch(URL);
  const data = (await resp.json()).data;

  const gas = ethers.utils.formatUnits(BigNumber.from(data.fast), 'gwei')

  gasCache.updated = + new Date();
  gasCache.value = {gas: parseInt(gas), price: data.priceUSD};

  return gasCache.value;
}


export default getCurrentGas;
