import { Contract, ethers } from "ethers";
import { Interface } from "ethers/lib/utils";

const contractAddress: string = '0xf4176d5B863150521A8c9CF2E617B7473eE688E0';

async function checkIfLicenced(): Promise<boolean>  {
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const abi = new Interface(['function checkIfLicenced(address _address) external view returns (bool)']);

  const contract = new Contract(contractAddress, abi, provider);

  const accounts = await provider.send("eth_accounts", []);
  if (accounts && accounts.length >= 1) {
    return await contract.checkIfLicenced(accounts[0]);
  }
  
  return false;
}

async function purchaseLicence(): Promise<boolean>  {
  try {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();

    const abi = new Interface(['function purchase() external payable', 'function licenceFee() view returns(uint256)']);
    const contract = new Contract(contractAddress, abi, signer);
    const accounts = await provider.send("eth_accounts", []);

    if (accounts && accounts.length >= 1) {
      const fee = await contract.licenceFee();
      const tx = await contract.purchase({
        value: fee
      });

      const rec = await tx.wait();
      return rec.status === 1;
    }
  } catch (error) {
    return false;
  }
  
  return false;
}


export {checkIfLicenced, purchaseLicence};
