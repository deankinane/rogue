import React, { ChangeEvent, useEffect, useState } from "react";
import MintContract from "../../entities/MintContract";
import ContractSearchBar from "../../components/contractSearchBar/ContractSearchBar";
import FunctionSelector from "../../components/functionSelector/FunctionSelector";
import ViewableFunctionDetail from "../../components/viewableFunctionDetail/ViewableFunctionDetail"; 
import CodeBlock from "../../components/codeBlock/CodeBlock";
import { Button, Card, Col, Form, InputGroup, Row, Spinner } from "react-bootstrap";
import GasWidget from "../../components/gasWidget/GasWidget";
import { defaultTransactionState, TransactionState, TransactionStateUpdate } from "../../entities/GlobalState";
import { FunctionFragment } from "ethers/lib/utils";
import WalletSelector from "../../components/walletSelector/WalletSelector";
import IWalletRecord from "../../entities/IWalletRecord";
import { Triangle } from "react-bootstrap-icons";
import { getWalletBalance, PendingTransactionGroup, prepareTransactions, sendTransactions, TransactionRequestGroup } from "../../entities/ProviderFunctions";
import MintStatusModal from "../../components/mintStatusModal/MintStatusModal";
import useNodeStorage from "../../hooks/useNodeStorage";
import { BigNumber, ethers } from "ethers";
import useWalletStorage from "../../hooks/useWalletStorage";
import useOnMount from "../../hooks/useOnMount";
import { useNavigate } from "react-router-dom";
import useIsLicensed from "../../hooks/useIsLicensed";
import useSignedIn from "../../hooks/useSignedIn";
import useToast from "../../hooks/useToast";
import ScheduleTaskModal from "../../components/scheduleTaskModal/ScheduleTaskModal";

export default function MintPage() {
  const [contract, setContract] = useState<MintContract>();
  const [wallets, setWallets] = useWalletStorage();
  const licensed = useIsLicensed();
  const [signedIn] = useSignedIn();
  const navigate = useNavigate();
  const [render, setRender] = useState(false);
  const sendToast = useToast();

  const [transactionState, setTransactionState] = useState<TransactionState>({
    ...defaultTransactionState,
    selectedWallets: [wallets[0]],
  });
  const [sentTransactionSettings, setSentTransactionSettings] = useState<TransactionState>(defaultTransactionState);
  const [sentTransactionRequests, setSentTransactionRequests] = useState<TransactionRequestGroup[]>(new Array<TransactionRequestGroup>());
  const [loading, setLoading] = useState(false);  
  const [pendingTransactions, setPendingTransactions] = useState(new Array<PendingTransactionGroup>())
  const [showMintStatusModal, setShowMintStatusModal] = useState(false);
  const [node] =  useNodeStorage();
  const [mintCost, setMintCost] = useState('');
  const [totalCost, setTotalCost] = useState('');
  const [minting, setMinting] = useState(false);
  const [showScheduleTaskModal, setScheduleTaskModal] = useState(false);

  useOnMount(async () => {
    document.title = 'ROGUE - Mint NFTs Fast'
    if(node) {
      for(let i=0; i<wallets.length; i++) {
        wallets[i].balance = await getWalletBalance(wallets[i].publicKey, node)
      }
      setWallets(wallets);
    }
  })

  useEffect(() => {
    if (!licensed.checked) return;
    if (!licensed.licensed || !signedIn) navigate('/');
    setRender(true);
  },[licensed, signedIn])

  function updateTransactionState(t: TransactionStateUpdate) {
    setTransactionState({
      ...transactionState,
      ...t
    });
  }

  useEffect(() => {
    if(isNaN(transactionState.pricePerUnit) || isNaN(transactionState.transactionsPerWallet) || isNaN(transactionState.unitsPerTxn))
      return;
    const totalRounded = (transactionState.pricePerUnit * transactionState.unitsPerTxn  * transactionState.transactionsPerWallet * transactionState.selectedWallets.length).toFixed(4);
    const total = ethers.utils.parseEther(totalRounded);
    const gas = ethers.utils.parseUnits(`${transactionState.maxGasFee * transactionState.transactionsPerWallet * transactionState.selectedWallets.length * 100000}`, 'gwei');
    const mintCost = ethers.utils.formatEther(total); 
    setMintCost(parseFloat(mintCost).toFixed(4));
    const result = ethers.utils.formatEther(total.add(gas));
    setTotalCost(parseFloat(result).toFixed(4))
  },[transactionState])

  function onSearchContract(address: string) {
    setLoading(true);
    setContract(undefined);
    const newContract = new MintContract(address);
    newContract.init().then(() => {
      setContract(newContract);
      updateTransactionState({
        contractAddress: newContract.address
      });
      document.title = `${newContract.contractName} - ROGUE - Mint NFTs FAST`
      setLoading(false);
    })
    .catch((e:Error) => {
      sendToast('Load Contract Failed', e.message, 'error');
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

  function onUnitsPerTxnChanged(e: ChangeEvent<HTMLInputElement>) {
    updateTransactionState({
      unitsPerTxn: parseInt(e.currentTarget.value)
    });
  } 

  function onPricePerUnitChanged(e: ChangeEvent<HTMLInputElement>) {
    updateTransactionState({
      pricePerUnit: parseFloat(e.currentTarget.value)
    });
  } 

  function onTxnsPerWalletChanged(e: ChangeEvent<HTMLInputElement>) {
    updateTransactionState({
      transactionsPerWallet: parseFloat(e.currentTarget.value)
    });
  } 

  function onGasFeeChanged(gas: number) {
    updateTransactionState({
      maxGasFee: gas
    });
  } 

  function onSetUnitPriceClicked(value: string) {
    updateTransactionState({
      pricePerUnit: parseFloat(ethers.utils.formatEther(BigNumber.from(value)))
    });
  }

  function onSetUnitsPerTxnClicked(value: string) {
    updateTransactionState({
      unitsPerTxn: parseInt(value)
    });
  }

  function invalidConfiguration(): boolean {
    return contract === undefined 
      || transactionState.selectedWallets.length === 0
      || transactionState.maxGasFee < 1
      || transactionState.pricePerUnit < 0
      || transactionState.transactionsPerWallet < 1
      || transactionState.unitsPerTxn < 1
      || isNaN(transactionState.maxGasFee)
      || isNaN(transactionState.pricePerUnit)
      || isNaN(transactionState.transactionsPerWallet)
      || isNaN(transactionState.unitsPerTxn)
      || transactionState.mintFunction === undefined
  }

  async function mint() {
    setMinting(true);
    if(!node) return //TODO display error
    if (!contract || !transactionState.selectedWallets) return; //TODO Display error

    try {
      const txns = await prepareTransactions(contract, transactionState, node);
      const responses = await sendTransactions(txns, node);

      setSentTransactionRequests(txns)
      setPendingTransactions(responses);

      setSentTransactionSettings(transactionState);
      setShowMintStatusModal(true);
    } catch (error) {
      sendToast('Error', JSON.stringify(error), 'error')
    }
    setMinting(false);
  }

  function scheduleTaskClicked() {
    setScheduleTaskModal(true);
  }

  return (
    !render ? <></> : 
    <>
    <MintStatusModal 
      show={showMintStatusModal}
      pendingTransactionGroups={pendingTransactions}
      transactionRequestGroups={sentTransactionRequests}
      settings={sentTransactionSettings}
      onHide={() => {setShowMintStatusModal(false)}}
    />
    <ScheduleTaskModal 
      show={showScheduleTaskModal}
      settings={sentTransactionSettings}
      onHide={() => {setScheduleTaskModal(false)}}
      contract={contract}
    />
    <Row className='mb-3 g-2'>
        <Col>
          <h5 className='fw-bold mb-0'><Triangle className='me-3' />Mint</h5>
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
              label="Mint Function"
              functions={contract?.payables && contract?.payables.length > 0 ? contract?.payables : contract?.writables} 
              onFunctionSelected={onMintFunctionSelected}
            />
          
        </Card.Body>
      </Card>
      
      </Col>
      <Col>
        <Card className="h-100">
          <Card.Body>
            <p className="mb-0">Set Transaction Parameters</p>
            <Row className="g-2 mt-2">
              <Col xs={12} xl={6}>
                <InputGroup>
                  <InputGroup.Text>Mints per Txn</InputGroup.Text>
                  <Form.Control type="number" min={1} step={1} value={transactionState.unitsPerTxn} onChange={onUnitsPerTxnChanged} />
                </InputGroup>
              </Col>
              <Col xs={12} xl={6}>
                <InputGroup>
                  <InputGroup.Text>Txns per Wallet</InputGroup.Text>
                  <Form.Control type="number" min={1} value={transactionState.transactionsPerWallet} onChange={onTxnsPerWalletChanged} />
                </InputGroup>
              </Col>
            </Row>
            <Row className="g-2 mt-2">
              <Col xs={12} xl={6}>
                <InputGroup>
                  <InputGroup.Text>Cost per Mint</InputGroup.Text>
                  <Form.Control type="number" min={0} step={0.005} placeholder="ether" value={transactionState.pricePerUnit} onChange={onPricePerUnitChanged} />
                </InputGroup>
              </Col>
              <Col xs={12} xl={6}>
                <InputGroup>
                  <InputGroup.Text>Total</InputGroup.Text>
                  <InputGroup.Text className="flex-grow-1 d-flex justify-content-end">{mintCost} ETH</InputGroup.Text>
                </InputGroup>
              </Col>
            </Row>
            
            {
              transactionState.mintFunction?.inputs && transactionState.mintFunction?.inputs.length>1 ? (
                <>
                  <p>Additional Function Parameters</p>
                  {transactionState.mintFunction?.inputs.map((x,i) => 
                    (i>0 ? (
                      <InputGroup key={i} className="mt-3">
                        <InputGroup.Text className="mw-30">{x.name}</InputGroup.Text>
                        <Form.Control placeholder={x.type} type={x.type.startsWith('uint') ? 'number' : 'text'} onChange={v => onMintFunctionParamChanged(x.name, v.currentTarget.value)} />
                      </InputGroup>)
                    :<></>
                    )
                  )}
                </>
              )
              : <></> 
            }
            <p className="mt-3">Choose Gas Settings</p>
            <GasWidget onGasPriceChanged={onGasFeeChanged}/>
          </Card.Body>
        </Card>
      </Col>
      <Col>
        <Card className="h-100">
          <Card.Body className="d-flex flex-column">
            <div>              
              <p>Select Wallets</p>
              <WalletSelector onWalletSelectionChanged={onWalletSelectionChanged} wallets={wallets}/>   
            </div>
            <p className="mt-3">Mint Summary</p>
            <InputGroup className="justify-content-end">
              <InputGroup.Text className="flex-grow-1">Total Mints: {transactionState.unitsPerTxn * transactionState.transactionsPerWallet * transactionState.selectedWallets.length}</InputGroup.Text>
              <InputGroup.Text>Cost: {mintCost} ETH</InputGroup.Text>
              <InputGroup.Text>Total: <span className="fw-bold ms-1">{totalCost} ETH</span></InputGroup.Text>
            </InputGroup>
            <div className="flex-grow-1 d-flex justify-content-end">
              <Button 
                variant="secondary" 
                className="mt-3 align-self-end me-3" 
                disabled={contract === undefined}
                onClick={scheduleTaskClicked}
              >Schedule Task</Button>   
              <Button 
                style={{'width':'91px'}} 
                variant="success" 
                className="mt-3 align-self-end" 
                disabled={invalidConfiguration() || minting}
                onClick={mint}
              >{minting ? <Spinner size='sm' animation="border" /> : 'Mint Now'}</Button>    
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
            ? contract.viewables.map((x,i) => <ViewableFunctionDetail key={i} functionFragment={x} contract={contract} onSetUnitPriceClicked={onSetUnitPriceClicked} onSetUnitsPerTxnClicked={onSetUnitsPerTxnClicked} />)
            : <Card className="w-100 p-3">Read only values will display here</Card>
        }
        </div>        
      </Col>
    </Row>
    <CodeBlock code={contract ? contract?.contractSource : "// Contract source will display here"} />
    </>
  )
}
