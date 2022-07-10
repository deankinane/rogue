// const BaseUrl: string = 'https://api.etherscan.io/api?';
const BaseUrl: string = 'https://api-rinkeby.etherscan.io/api?';
const ApiKey: string = 'HDWIFT1YENSISZPJ8RU6P6PUFMZIEHX5WS';

async function getCurrentGas(): Promise<string> {
  const resp = await fetch(`${BaseUrl}module=gastracker&action=gasoracle&apiKey=${ApiKey}`);
  const gas = await resp.json();
  return gas.result.FastGasPrice;
}

async function getContractSource(address: string) : Promise<any> {
  const request = await fetch(`${BaseUrl}module=contract&action=getsourcecode&address=${address}&apiKey=${ApiKey}`);
  const result = await request.json();
  return result.result[0];
}

export {getCurrentGas, getContractSource};
