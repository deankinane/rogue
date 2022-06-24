
import { FunctionFragment } from "ethers/lib/utils"
import { useEffect, useState } from "react";
import { Button, OverlayTrigger, Spinner, Tooltip } from "react-bootstrap";
import { ArrowClockwise, Stack } from "react-bootstrap-icons";
import MintContract from "../../entities/MintContract";
import { getReadValue } from "../../entities/ProviderFunctions";
import useNodeStorage from "../../hooks/useNodeStorage";
import './ViewableFunctionDetail.css';

export interface ViewableFunctionDetailProps {
  contract: MintContract
  functionFragment: FunctionFragment
  onSetUnitPriceClicked:(value: string) => void
  onSetUnitsPerTxnClicked:(value: string) => void
}

export default function ViewableFunctionDetail({contract, functionFragment, onSetUnitPriceClicked, onSetUnitsPerTxnClicked}: ViewableFunctionDetailProps) {
  const [value, setValue] = useState("-");
  const [loading, setLoading] = useState(false);
  const [type, setType] = useState('');
  const [oldValue, setOldValue] = useState(false);
  const [node] = useNodeStorage();

  useEffect(() => {
      loadValue();
  }, [contract]);

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

    const val = await getReadValue(contract, functionFragment.name, node)
    clearTimeout(retry);
    setValue(val.toString());
    setOldValue(false);
    setLoading(false);
  }

  function getTooltip(message: string) {
    return (
      <Tooltip >
          {message}
      </Tooltip>
    )
  }

  return (
    <div className="function-card">
      <div className="d-flex">
        <p className="me-3">{functionFragment.name}</p>
        <p className="text-secondary pl-3 flex-grow-1 text-end">{type}</p>
      </div>
     <div className="d-flex align-items-center">
      <OverlayTrigger placement="bottom" overlay={getTooltip('Refresh')}>
        <Button size="sm" variant="info" className="text-bold" onClick={loadValue} disabled={loading}>{loading ? <Spinner size="sm" animation="border" /> : <ArrowClockwise />}</Button>
      </OverlayTrigger>
        
        {type.startsWith('uint') ? (
          <>
            <OverlayTrigger placement="bottom" overlay={getTooltip('Set Cost per Mint')}>
              <Button size="sm" variant='info' className='ms-2' onClick={() => onSetUnitPriceClicked(value)}>
                <img src='img/eth-logo.svg' alt='Ethereum logo' style={{'width':'1em'}} />
              </Button>
            </OverlayTrigger>
            <OverlayTrigger placement="bottom" overlay={getTooltip('Set Units per Txn')}>
              <Button size="sm" variant='info' className='ms-2' onClick={() => onSetUnitsPerTxnClicked(value)}><Stack/></Button>
            </OverlayTrigger>
          </>
        ):<></>}
       <p className={`function-card__value ${oldValue ? 'function-card__value--old' : ''}`}>{value}</p>
     </div>
    </div>
  )
}
