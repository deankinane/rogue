import { BigNumber, ethers } from 'ethers';
import React, {  useState } from 'react'
import { Button, FormControl, InputGroup } from 'react-bootstrap';
import { LightningChargeFill } from 'react-bootstrap-icons';
import getCurrentGas, { EthGasPrice } from '../../entities/GasNowApi';
import useRecursiveTimeout from '../../hooks/useRecursiveTimeout';
import './GasWidget.css';

export interface GasWidgetProps {
  onGasPriceChanged: (gasPrice: number) => void
}

function GasWidget({onGasPriceChanged} : GasWidgetProps) {
  const [gwei, setGwei] = useState<EthGasPrice>({base:0, max:0});
  const [extraGas, setExtraGas] = useState(10);

  useRecursiveTimeout(async() => {
    const gasprice = await getCurrentGas();
    setGwei(gasprice);
    onGasPriceChanged(gasprice.max+extraGas);
  }, 3000);

  function onExtraGasChanged(gas: number) {
    setExtraGas(gas);
    onGasPriceChanged(gwei.max+extraGas);
  }

  return (
    <>
      <InputGroup className="mb-1">
        <InputGroup.Text>
          <img className='gas-widget__icon' alt="gas-icon" src='./img/gas-pump.svg' />
          <span className='gas-widget__gwei ms-2'>Fast: {gwei.max}</span>
        </InputGroup.Text>
        <Button 
          variant='info' 
          onClick={() => onExtraGasChanged(10)} 
          className={(extraGas === 10 ? ' gas-widget__input--active' : '')}
          >+ 10</Button>
        <Button 
          variant='info' 
          onClick={() => onExtraGasChanged(20)} 
          className={(extraGas === 20 ? ' gas-widget__input--active' : '')}
          >+ 20</Button>
        <FormControl 
          type='number' 
          step={5}
          value={extraGas} 
          className='gas-widget__input'
          onChange={v => onExtraGasChanged(parseInt(v.currentTarget.value))}
          />
        <InputGroup.Text >
          <span className='widget__icon'>
            <LightningChargeFill />
          </span>
          <span className='gas-widget__gwei ms-1'>
            Max: {gwei.max + extraGas}
          </span>
        </InputGroup.Text>
        {/* <InputGroup.Text >
          <span className='widget__icon'>
            <FlagFill />
          </span>
          <span className='gas-widget__gwei ms-1'>
            EPF: {extraGas}
          </span>
        </InputGroup.Text> */}
      </InputGroup>
      <p className='gas-widget__estimate'>Estimate per txn: {ethers.utils.formatUnits(BigNumber.from((gwei.max+extraGas)*100000), 'gwei')} ETH</p>
    </>
  )
}

export default GasWidget
