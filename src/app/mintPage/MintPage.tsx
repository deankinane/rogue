import React, { ChangeEvent, useState } from "react";
import MintContract from "../../entities/MintContract";
import ContractSearchBar from "../../components/contractSearchBar/ContractSearchBar";
import FunctionSelector from "../../components/functionSelector/FunctionSelector";
import ViewableFunctionDetail from "../../components/viewableFunctionDetail/ViewableFunctionDetail"; 
import CodeBlock from "../../components/codeBlock/CodeBlock";
import { Button, Card, Col, Form, InputGroup, Row } from "react-bootstrap";
import GasWidget from "../../components/gasWidget/GasWidget";
import { TransactionState } from "../../entities/GlobalState";
import { FunctionFragment } from "ethers/lib/utils";
import WalletSelector from "../../components/walletSelector/WalletSelector";
import IWalletRecord from "../../entities/IWalletRecord";
import { FiletypeJpg } from "react-bootstrap-icons";
import { PendingTransactionGroup, prepareTransactions, sendTransactions, TransactionRequestGroup } from "../../entities/ProviderFunctions";
import MintStatusModal from "../../components/mintStatusModal/MintStatusModal";


export default function MintPage() {
  const [contract, setContract] = useState<MintContract>();
  const [transactionState, setTransactionState] = useState<TransactionState>({});
  const [sentTransactionSettings, setSentTransactionSettings] = useState<TransactionState>({});
  const [sentTransactionRequests, setSentTransactionRequests] = useState<TransactionRequestGroup[]>(new Array<TransactionRequestGroup>());
  const [loading, setLoading] = useState(false);  
  const [pendingTransactions, setPendingTransactions] = useState(new Array<PendingTransactionGroup>())
  const [showMintStatusModal, setShowMintStatusModal] = useState(false);

  function updateTransactionState(t: TransactionState) {
    setTransactionState({
      ...transactionState,
      ...t
    });
  }

  function onSearchContract(address: string) {
    setLoading(true);
    setContract(undefined);
    const newContract = new MintContract(address);
    newContract.init().then(() => {
      setContract(newContract);
      updateTransactionState({
        contractAddress: newContract.address
      });
      setLoading(false);
    });
  }
  
  function onMintFunctionSelected(f: FunctionFragment) {
    updateTransactionState({
      mintFunction: f
    });
  }

  function onMintFunctionParamChanged(param: string, value: string){
    const params = transactionState.functionParams || new Map<string, string>();
    params.set(param, value);
    updateTransactionState({
      functionParams: params
    });
  }

  function onWalletSelectionChanged(selectedWallets: IWalletRecord[]) {
    updateTransactionState({
      selectedWallets: selectedWallets
    });
  }

  function onMintCostChanged(e: ChangeEvent<HTMLInputElement>) {
    updateTransactionState({
      totalCost: parseFloat(e.currentTarget.value)
    });
  } 

  function onTxnsPerWalletChanged(e: ChangeEvent<HTMLInputElement>) {
    updateTransactionState({
      transactionsPerWallet: parseFloat(e.currentTarget.value)
    });
  } 

  function onExtraGasChanged(gas: number) {
    updateTransactionState({
      maxGasFee: gas
    });
  } 

  async function mint() {

    if (!contract || !transactionState.selectedWallets) return; //TODO Display error

    const txns = await prepareTransactions(contract, transactionState);

    if (txns.length === 0) {
      console.log('Failed to create txns', txns)
      return;
      // TODO display error
    }

    const responses = await sendTransactions(txns);

    if (responses.length === 0) {
      console.log('Failed to send txns')
      return;
      // TODO display error
    }

    setSentTransactionRequests(txns)
    setSentTransactionSettings(transactionState);
    setPendingTransactions(responses);

    // const testTrans = new Array<PendingTransactionGroup>();
    // testTrans.push({
    //   wallet: transactionState.selectedWallets[0],
    //   transactions: new Array<Promise<TransactionResponse>>()
    // })

    // testTrans[0].transactions.push(new Promise<TransactionResponse>(resolve => {
    //   setTimeout(() => {
    //     resolve({
    //       chainId: 2,
    //       hash: 'xxxx',
    //       data: 'data',
    //       confirmations: 5,
    //       from: 'from',
    //       nonce: 100,
    //       gasLimit: BigNumber.from(30000),
    //       value: BigNumber.from(1),
    //       wait: (confirmations?: number) => new Promise<TransactionReceipt>(res => {
    //         setTimeout(() => {
    //           res({
    //             blockHash : '',
    //             byzantium: true,
    //             confirmations: 5,
    //             contractAddress: '0x000',
    //             blockNumber: 10000,
    //             cumulativeGasUsed: BigNumber.from(30000),
    //             effectiveGasPrice: BigNumber.from(30000),
    //             from: '0x000',
    //             gasUsed: BigNumber.from(30000),
    //             logs: new Array<Log>(),
    //             logsBloom: '',
    //             to: '0x000',
    //             transactionHash: '',
    //             transactionIndex: 0,
    //             type: 2
    //           })
    //         }, 10000)
    //       })
    //     })
    //   },10000)
    // }))

    // testTrans[0].transactions.push(new Promise<TransactionResponse>(resolve => {
    //   setTimeout(() => {
    //     resolve({
    //       chainId: 2,
    //       hash: 'xxxx',
    //       data: 'data',
    //       confirmations: 5,
    //       from: 'from',
    //       nonce: 100,
    //       gasLimit: BigNumber.from(30000),
    //       value: BigNumber.from(1),
    //       wait: (confirmations?: number) => new Promise<TransactionReceipt>((res,rej) => {
    //         setTimeout(() => {
    //           rej('')
    //         },10000)
    //       })
    //     })
    //   },10000)
    // }))

    // setPendingTransactions(testTrans);
    
    setShowMintStatusModal(true);
  }



  return (

    <>
    <MintStatusModal 
      show={showMintStatusModal}
      pendingTransactionGroups={pendingTransactions}
      transactionRequestGroups={sentTransactionRequests}
      settings={sentTransactionSettings}
      onHide={() => {setShowMintStatusModal(false)}}
    />
    <Row className='mb-3'>
        <Col>
          <h5 className='fw-bold mb-0'><FiletypeJpg className='me-3' />Mint</h5>
        </Col>
        <Col>
          <h5 className='fw-bold float-end'>{contract ? contract.contractName : 'No Contract Loaded'}</h5>
        </Col>
      </Row>
    <Row className="d-flex align-items-stretch mb-3 g-3">
    <Col>
      <Card  className="h-100">
        <Card.Body>
          <div>
            <p>Load Contract</p>
          </div>
          
        
          <ContractSearchBar onSearch={onSearchContract} loading={loading}  />
          <div className="clearfix"></div>
          <p className="mt-3">Select Mint Function</p>
            <FunctionSelector 
              functions={contract?.payables} 
              onFunctionSelected={onMintFunctionSelected}
            />
          
        </Card.Body>
      </Card>
      
      </Col>
      <Col>
        <Card className="h-100">
          <Card.Body>
            <p>Set Transaction Parameters</p>
            {
              transactionState.mintFunction?.inputs.map((x,i) => 
              (<InputGroup key={i} className="mt-3">
                <InputGroup.Text className="mw-30">{x.name}</InputGroup.Text>
                <Form.Control placeholder={x.type} type={x.type.startsWith('uint') ? 'number' : 'text'} onChange={v => onMintFunctionParamChanged(x.name, v.currentTarget.value)} />
              </InputGroup>))
            }
            <InputGroup className="mt-3">
              <InputGroup.Text className=" mw-30">Price per txn</InputGroup.Text>
              <Form.Control type="number" step={0.005} placeholder="ether" onChange={onMintCostChanged} />
            </InputGroup>
            <InputGroup className="mt-3">
              <InputGroup.Text className="mw-30">Txns per wallet</InputGroup.Text>
              <Form.Control type="number" onChange={onTxnsPerWalletChanged} />
            </InputGroup>
          </Card.Body>
        </Card>
      </Col>
      <Col>
        <Card className="h-100">
          <Card.Body className="d-flex flex-column">
            <div>
              <p>Choose Gas Settings</p>
              <GasWidget onGasPriceChanged={onExtraGasChanged}/>
              <p>Select Wallets</p>
              <WalletSelector onWalletSelectionChanged={onWalletSelectionChanged}/>   
            </div>
            <div className="flex-grow-1 d-flex justify-content-end">
            <Button 
                variant="secondary" 
                className="mt-3 align-self-end me-3" 
                disabled={contract === undefined}
              >Schedule Task</Button>   
              <Button 
                variant="success" 
                className="mt-3 align-self-end" 
                disabled={contract === undefined}
                onClick={mint}
              >Mint Now</Button>    
            </div>
               
          </Card.Body>
        </Card>
      </Col>
    </Row>
    <Row className="mb-3">
      <Col>
        <div className="d-flex flex-row overflow-auto">
        {
          contract
            ? contract.viewables.map((x,i) => <ViewableFunctionDetail key={i} functionFragment={x} contract={contract} />)
            : <Card className="w-100 p-3">Read only values will display here</Card>
        }
        </div>        
      </Col>
    </Row>
    <CodeBlock code={contract ? contract?.contractSource : "// Contract source will display here"} />
    </>
  )
}
