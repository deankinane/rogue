
import { FunctionFragment } from "ethers/lib/utils"
import { useEffect, useState } from "react";
import { Button, Spinner } from "react-bootstrap";
import { ArrowClockwise } from "react-bootstrap-icons";
import MintContract from "../../entities/MintContract";
import { getReadValue } from "../../entities/ProviderFunctions";
import './ViewableFunctionDetail.css';

export interface ViewableFunctionDetailProps {
  contract: MintContract
  functionFragment: FunctionFragment
}

export default function ViewableFunctionDetail({contract, functionFragment}: ViewableFunctionDetailProps) {
  const [value, setValue] = useState("-");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
      loadValue();
  }, [contract]);
  
  async function loadValue() {
    setLoading(true);
    const val = await getReadValue(contract, functionFragment.name)
    setValue(val.toString());
    setLoading(false);
  }

  return (
    <div className="function-card">
      <div className="d-flex align-items-center">
        <p>{functionFragment.name}</p>
        {functionFragment.outputs?.map((x,i) => <p key={i} className="function__value__type pl-3">{x.type}</p>)}
      </div>
     <div className="d-flex align-items-center">
        <Button size="sm" variant="info" className="text-bold" onClick={loadValue} disabled={loading}>{loading ? <Spinner size="sm" animation="border" /> : <ArrowClockwise />}</Button>
       <p className="function-card__value">{value}</p>
     </div>
    </div>
  )
}
