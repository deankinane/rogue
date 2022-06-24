import { BLOCKNATIVE_APPID } from "./constants";

const URL: string = 'https://api.blocknative.com/gasprices/blockprices';
export interface EthGasPrice {
  base:number
  max:number
}

interface GasCache {
  updated: number,
  value: EthGasPrice
}

const gasCache: GasCache = {
  updated: 0,
  value: {base:0, max:0}
}

async function getCurrentGas(): Promise<EthGasPrice> {
  if (+ new Date() - gasCache.updated < 3001) {
    return gasCache.value;
  }

  const resp = await fetch(URL, {
    headers: {
      Authorization: BLOCKNATIVE_APPID
    }
  });
  const data = (await resp.json());

  gasCache.updated = + new Date();
  gasCache.value.max = parseInt(data.blockPrices[0].estimatedPrices[0].maxFeePerGas);
  gasCache.value.base = parseInt(data.blockPrices[0].baseFeePerGas);

  return gasCache.value;
}


export default getCurrentGas;
