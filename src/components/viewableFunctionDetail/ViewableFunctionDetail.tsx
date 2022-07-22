
import { FunctionFragment } from "ethers/lib/utils"
import { node } from "prop-types";
import { useEffect, useRef, useState } from "react";
import { Button, OverlayTrigger, Spinner, Tooltip } from "react-bootstrap";
import { ArrowClockwise, Stack } from "react-bootstrap-icons";
import { useSettingsStore } from "../../application-state/settingsStore/SettingsStore";
import MintContract from "../../entities/MintContract";
import { getReadValue } from "../../entities/ProviderFunctions";
import './ViewableFunctionDetail.css';

export interface ViewableFunctionDetailProps {
  contract: MintContract
  functionFragment: FunctionFragment
  onSetUnitPriceClicked:(value: string) => void
  onSetUnitsPerTxnClicked:(value: string) => void
  onMaxSupplyLoaded:(value: number) => void
  onOwnerLoaded:(value: string) => void
}

export default function ViewableFunctionDetail({
  contract, 
  functionFragment, 
  onSetUnitPriceClicked, 
  onSetUnitsPerTxnClicked,
  onMaxSupplyLoaded,
  onOwnerLoaded
}: ViewableFunctionDetailProps) {
  const [value, setValue] = useState("-");
  const [loading, setLoading] = useState(false);
  const [type, setType] = useState('');
  const [oldValue, setOldValue] = useState(false);
  const {settings} = useSettingsStore()
  const intial = useRef('');

  useEffect(() => {
    if(intial.current !== contract.address){
      intial.current = contract.address;
      loadValue();
    }
  }, [functionFragment]);

  useEffect(() => {
    if (functionFragment.outputs) {
      setType(functionFragment.outputs[0].type);
    }
  }, [functionFragment])
  
  
  async function loadValue() {
    if (!node) return //TODO Something  better

    setLoading(true);
    const retry = setTimeout(async () => {
      setLoading(false);
      setOldValue(true);
    },5000)

    const val = await getReadValue(contract, functionFragment.name, settings.node)
    clearTimeout(retry);
    setValue(val.toString());
    setOldValue(false);
    setLoading(false);

    if (isMaxSupply()) {
      onMaxSupplyLoaded(parseInt(val));
    }

    if(isOWner()) {
      onOwnerLoaded(val[0])
    }
  }

  function isMaxSupply(): boolean {
    const nameNormalised = functionFragment.name.toUpperCase();
    return nameNormalised.indexOf('MAX') > -1 && nameNormalised.indexOf('SUPPLY') > -1;
  }

  function isOWner(): boolean {
    const nameNormalised = functionFragment.name.toUpperCase();
    return nameNormalised === 'OWNER'
  }

  return (
    <div className="function-card">
      <div className="d-flex">
        <p className="me-3">{functionFragment.name}</p>
        <p className="text-secondary pl-3 flex-grow-1 text-end">{type}</p>
      </div>
     <div className="d-flex align-items-center">
      <Button 
        size="sm" 
        variant="info" 
        className="text-bold" 
        onClick={loadValue} 
        title='Refresh'
        disabled={loading}>{loading ? <Spinner size="sm" animation="border" /> : <ArrowClockwise />}</Button>
        
        {type.startsWith('uint') ? (
          <>
            <Button size="sm" title='Set Cost per Mint' variant='info' className='ms-2' onClick={() => onSetUnitPriceClicked(value)}>
              <img src='img/eth-logo.svg' alt='Ethereum logo' style={{'width':'1em'}} />
            </Button>
            <Button size="sm" title='Set Units per Txn' variant='info' className='ms-2' onClick={() => onSetUnitsPerTxnClicked(value)}><Stack/></Button>
          </>
        ):<></>}
       <p className={`function-card__value ${oldValue ? 'function-card__value--old' : ''}`}>{value}</p>
     </div>
    </div>
  )
}

