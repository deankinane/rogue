import React, { ChangeEvent, useEffect, useState } from "react";
import MintContract from "../../entities/MintContract";
import ContractSearchBar from "../../components/contractSearchBar/ContractSearchBar";
import FunctionSelector from "../../components/functionSelector/FunctionSelector";
import ViewableFunctionDetail from "../../components/viewableFunctionDetail/ViewableFunctionDetail"; 
import CodeBlock from "../../components/codeBlock/CodeBlock";
import { Button, Card, Col, Form, InputGroup, Nav, Row, Spinner, Tab } from "react-bootstrap";
import GasWidget from "../../components/gasWidget/GasWidget";
import { CustomParam, defaultTransactionState, TransactionState, TransactionStateUpdate } from "../../entities/GlobalState";
import { FunctionFragment } from "ethers/lib/utils";
import WalletSelector from "../../components/walletSelector/WalletSelector";
import IWalletRecord from "../../entities/IWalletRecord";
import { Calendar2DateFill, GearFill, Triangle, WalletFill } from "react-bootstrap-icons";
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
import { isBrowser } from 'react-device-detect';
import CustomFunctionParam from "../../components/customFunctionParam/CustomFunctionParam";
import WalletManager from "../walletManager/WalletManager";
import SettingsPage from "../settingsPage/SettingsPage";

export default function MintPage() {
  const [contract, setContract] = useState<MintContract>();
  const [wallets, setWallets, updateWalletContents, filterHiddenCollections] = useWalletStorage();
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
  const [pendingTransactions, setPendingTransactions] = useState(new Array<PendingTransactionGroup>())
  const [showMintStatusModal, setShowMintStatusModal] = useState(false);
  const [node] =  useNodeStorage();
  const [totalPerWallet, setTotalPerWallet] = useState('');
  const [totalCost, setTotalCost] = useState('');
  const [minting, setMinting] = useState(false);
  const [showScheduleTaskModal, setScheduleTaskModal] = useState(false);
  const [mintFunction, setMintFunction] = useState<FunctionFragment>(FunctionFragment.from('temp() view returns (uint256)'));
  const [findFunction, setFindFunction] = useState('')
  const [needsManualParamSettings, setNeedsManualParamSettings] = useState(false)

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

  useEffect(() => {
    
  }, wallets)

  function updateTransactionState(t: TransactionStateUpdate) {
    setTransactionState({
      ...transactionState,
      ...t
    });
  }

  useEffect(() => {
    if(isNaN(transactionState.pricePerUnit) || isNaN(transactionState.totalCost) || isNaN(transactionState.transactionsPerWallet) || isNaN(transactionState.unitsPerTxn))
      return;

    const costPerTxn = ethers.utils.parseEther(`${transactionState.totalCost}`)
    const gasPerTxn = ethers.utils.parseUnits(`${transactionState.maxGasFee * 100000}`, 'gwei')
    const totalPerTxn = costPerTxn.add(gasPerTxn);
    const totalPerWallet = totalPerTxn.mul(transactionState.transactionsPerWallet)
    const total = totalPerWallet.mul(transactionState.selectedWallets.length)

    setTotalPerWallet(parseFloat(ethers.utils.formatEther(totalPerWallet)).toFixed(4))
    setTotalCost(parseFloat(ethers.utils.formatEther(total)).toFixed(4))
  },[transactionState])

  function onSearchContract(newContract: MintContract) {
    setContract(newContract);
    updateTransactionState({
      contractAddress: newContract.address
    });
    document.title = `${newContract.contractName} - ROGUE - Mint NFTs Fast`
  }
  
  function onMintFunctionSelected(f: FunctionFragment) {
    setMintFunction(f);
    setFindFunction(f.name)
    
    if (!(f.inputs.length === 1 && f.inputs[0].type.startsWith('uint'))) {
      setNeedsManualParamSettings(true)
    }
    else {
      setNeedsManualParamSettings(false)
    }
  }

  function onMintFunctionParamChanged(param: CustomParam){
    const params = transactionState.functionParams || new Array<CustomParam>();
    const idx = params.findIndex(x => x.name === param.name);

    if (idx > -1) {
      params[idx] = param
    }
    else {
      params.push(param)
    }

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
      unitsPerTxn: parseInt(e.currentTarget.value),
      totalCost: transactionState.pricePerUnit * parseInt(e.currentTarget.value)
    });
  } 

  function onPricePerUnitChanged(e: ChangeEvent<HTMLInputElement>) {
    updateTransactionState({
      pricePerUnit: parseFloat(e.currentTarget.value),
      totalCost: parseFloat(e.currentTarget.value) * transactionState.unitsPerTxn
    });
  } 

  function onTxnsPerWalletChanged(e: ChangeEvent<HTMLInputElement>) {
    updateTransactionState({
      transactionsPerWallet: parseFloat(e.currentTarget.value)
    });
  } 

  function onTotalCostChanged(e: ChangeEvent<HTMLInputElement>) {
    updateTransactionState({
      totalCost: parseFloat(e.currentTarget.value)
    });
  } 

  function onGasFeeChanged(gas: number) {
    updateTransactionState({
      maxGasFee: gas
    });
  } 

  function onSetUnitPriceClicked(value: string) {
    updateTransactionState({
      pricePerUnit: parseFloat(ethers.utils.formatEther(BigNumber.from(value))),
      totalCost: parseFloat(ethers.utils.formatEther(BigNumber.from(value))) * transactionState.unitsPerTxn
    });
  }

  function onSetUnitsPerTxnClicked(value: string) {
    updateTransactionState({
      unitsPerTxn: parseInt(value),
      totalCost: transactionState.pricePerUnit * parseInt(value)
    });
  }

  function onMaxSupplyLoaded(value: number) {
    updateTransactionState({
      maxSupply: value
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
  }

  async function mint() {
    setMinting(true);
    if(!node) return //TODO display error
    if (!contract || !transactionState.selectedWallets) return; //TODO Display error
    transactionState.mintFunction = mintFunction;
    transactionState.customParams = needsManualParamSettings;
    setTransactionState(transactionState)
    
    try {
      const txns = await prepareTransactions(contract, transactionState, node);
      const responses = await sendTransactions(txns, node);

      setSentTransactionRequests(txns)
      setPendingTransactions(responses);

      setSentTransactionSettings(transactionState);
      setShowMintStatusModal(true);
    } catch (error:any) {
      sendToast('Error', JSON.stringify(error.message), 'error')
    }
    setMinting(false);
  }

  function scheduleTaskClicked() {
    setScheduleTaskModal(true);
  }

  return (
    !render ? <></> : 
    <>
    <Row className='g-0 h-100 w-100'>
      {/* MAIN COLUMN START */}
      <Col xs={12} xl={8} className='d-flex flex-column h-100 p-4'>
        <Row className='mb-4 mt-1'>
          <Col>
          {contract && contract.contractLogo ? <img className='contract-logo' src={contract.contractLogo} alt={`${contract.contractName} Logo`}/> : <Triangle className='contract-logo me-3' />}
          <h5 className='fw-bold'>{contract ? contract.contractName : 'No Contract Loaded'}</h5>

          </Col>
        </Row>
        <Row className="d-flex align-items-stretch mb-3 g-3">
        <Col xs={12} lg={4}>
          <Card  className="h-100">
            <Card.Body>
              <div>
                <p className="mb-0">Load Contract</p>
              </div>
              
            
              <ContractSearchBar onContractLoaded={onSearchContract} />
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
          <Col xs={12} lg={4}>
            <Card className="h-100">
              <Card.Body>
                <p className="mb-0">Set Transaction Parameters</p>
                <Row className="g-2 mt-2">
                  <Col xs={12} xl={6}>
                    <InputGroup>
                      <InputGroup.Text>Mints per Txn</InputGroup.Text>
                      <Form.Control type="number" min={1} step={1} value={transactionState.unitsPerTxn} onChange={onUnitsPerTxnChanged} disabled={needsManualParamSettings}/>
                    </InputGroup>
                  </Col>
                  <Col xs={12} xl={6}>
                    <InputGroup>
                      <InputGroup.Text>Txns per Wallet</InputGroup.Text>
                      <Form.Control type="number" min={1} value={transactionState.transactionsPerWallet} onChange={onTxnsPerWalletChanged} />
                    </InputGroup>
                  </Col>
                </Row>
                <Row className="g-2 mt-0">
                  <Col xs={12} xl={6}>
                    <InputGroup>
                      <InputGroup.Text>Cost per Mint</InputGroup.Text>
                      <Form.Control type="number" min={0} step={0.005} placeholder="ether" value={transactionState.pricePerUnit} onChange={onPricePerUnitChanged} disabled={needsManualParamSettings}/>
                    </InputGroup>
                  </Col>
                  <Col xs={12} xl={6}>
                    <InputGroup>
                      <InputGroup.Text>Total per Wallet</InputGroup.Text>
                      <Form.Control type="number" min={0} step={0.005} placeholder="ether" value={transactionState.totalCost} onChange={onTotalCostChanged} />
                    </InputGroup>
                  </Col>
                </Row>
                
                {
                  needsManualParamSettings && mintFunction.inputs.length > 0 ? (
                    <>
                      <p className="mt-3">Custom Function Parameters</p>
                      {mintFunction?.inputs.map((x,i) => <CustomFunctionParam functionParam={x} key={i} onParamUpdated={onMintFunctionParamChanged} />)
                      }
                    </>
                  )
                  : <></> 
                }
                <p className="mt-3">Choose Gas Settings</p>
                <GasWidget onGasPriceChanged={onGasFeeChanged}/>
              </Card.Body>
            </Card>
          </Col>
          <Col xs={12} lg={4}>
            <Card className="h-100">
              <Card.Body className="d-flex flex-column">
                <div>              
                  <p>Select Wallets</p>
                  <WalletSelector onWalletSelectionChanged={onWalletSelectionChanged} wallets={wallets}/>   
                </div>
                <p className="mt-3">Mint Summary</p>
                <InputGroup className="justify-content-end">
                  <InputGroup.Text className="flex-grow-1">Total Mints: {transactionState.unitsPerTxn * transactionState.transactionsPerWallet * transactionState.selectedWallets.length}</InputGroup.Text>
                  <InputGroup.Text>Per Wallet: {totalPerWallet} ETH</InputGroup.Text>
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
          <Col xs={12}>
            <div className="d-flex flex-row overflow-auto">
            {
              contract
                ? contract.viewables.map((x,i) => (
                  <ViewableFunctionDetail 
                    key={i} 
                    functionFragment={x} 
                    contract={contract} 
                    onSetUnitPriceClicked={onSetUnitPriceClicked} 
                    onSetUnitsPerTxnClicked={onSetUnitsPerTxnClicked}
                    onMaxSupplyLoaded={onMaxSupplyLoaded} />)
                )
                  
                : <Card className="w-100 p-3">Read only values will display here</Card>
            }
            </div>        
          </Col>
        </Row>
        {
          isBrowser 
          ? <CodeBlock findFunction={findFunction} code={contract ? contract?.contractSource : "// Contract source will display here"} />
          : <></>
        }
      </Col>
      {/* MAIN END START */}
      <Col xs={12} xl={4} className="h-100 dark-panel">
        <Tab.Container defaultActiveKey="wallets">
          <Nav variant="pills">
            <Nav.Item>
              <Nav.Link eventKey="wallets"><WalletFill /> Wallets</Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link eventKey="tasks"><Calendar2DateFill /> Tasks</Nav.Link>
            </Nav.Item>
            <Nav.Item className="float-end">
              <Nav.Link eventKey="settings"><GearFill /> Settings</Nav.Link>
            </Nav.Item>
          </Nav>
          <Tab.Content>
            <Tab.Pane eventKey="wallets">
              <WalletManager wallets={wallets} onUpdateWallets={x => setWallets(x)} filterHiddenCollections={filterHiddenCollections} />
            </Tab.Pane>
            <Tab.Pane eventKey="tasks">
              
            </Tab.Pane>
            <Tab.Pane eventKey="settings">
              <SettingsPage />
            </Tab.Pane>
          </Tab.Content>
        </Tab.Container>
      </Col>
    </Row>
    <MintStatusModal 
      show={showMintStatusModal}
      pendingTransactionGroups={pendingTransactions}
      transactionRequestGroups={sentTransactionRequests}
      settings={sentTransactionSettings}
      onHide={() => {setShowMintStatusModal(false)}}
    />
    <ScheduleTaskModal 
      show={showScheduleTaskModal}
      transactionState={sentTransactionSettings}
      onHide={() => {setScheduleTaskModal(false)}}
      contract={contract}
    />
    
    </>
  )
}
