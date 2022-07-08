import { FunctionFragment, Interface } from "ethers/lib/utils";
import { FragmentTypes, FunctionTypes } from "./constants";
import { getContractSource } from "./EtherscanApi";
import { loadCollectionDetails } from "./IcyApi";

class MintContract {
  address: string;
  contractName: string = "";
  contractSource: string = "";
  contractSlug: string = "";
  contractLogo: string = "";
  abi: Interface | null = null;
  payables: FunctionFragment[];
  writables: FunctionFragment[];
  viewables: FunctionFragment[];

  constructor(address: string) {
    this.address = address;
    this.payables = new Array<FunctionFragment>();
    this.writables = new Array<FunctionFragment>();
    this.viewables = new Array<FunctionFragment>();
  }

  async init() {
    const data = await getContractSource(this.address);

    if(!data.ContractName) {
      throw new Error('Contract source code not verified')
    }


    this.contractName = data.ContractName;
    try {
      let source: any;
      if (data.SourceCode.startsWith("{{")) {
        source = JSON.parse(data.SourceCode.replace("{{", "{").replace("}}","}"))
        Object.entries(source.sources).forEach(item => {
          this.contractSource += (item[1] as any).content;
        });
      }
      else {
        source = JSON.parse(data.SourceCode)
        Object.entries(source).forEach(item => {
          this.contractSource += (item[1] as any).content;
        });
      }      

    } catch (error) {
      this.contractSource = data.SourceCode;
    }

    this.abi = new Interface(JSON.parse(data.ABI));

    // Find the payable and writable functions in the contract
    this.abi.fragments.forEach(f => {
      if (f.type === FragmentTypes.function) {
        const func = f as FunctionFragment;
        if (func.stateMutability === FunctionTypes.payable) {
          this.payables.push(func);
        }
        else if (func.stateMutability === FunctionTypes.nonpayable) {
          this.writables.push(func);
        }
        else if (func.stateMutability === FunctionTypes.view && func.inputs.length === 0) {
          this.viewables.push(func);
        }
      }
    });

    const details = await loadCollectionDetails(this.address)
    if (details !== null) {
      this.contractName = details.name
      this.contractLogo = details.logo
      this.contractSlug = details.slug
    }
  }
}

export default MintContract;
