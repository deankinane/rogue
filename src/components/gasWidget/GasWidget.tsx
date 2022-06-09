import { BigNumber, ethers } from 'ethers';
import React, {  useState } from 'react'
import { Button, FormControl, InputGroup } from 'react-bootstrap';
import { LightningChargeFill } from 'react-bootstrap-icons';
import getCurrentGas from '../../entities/GasNowApi';
import useRecursiveTimeout from '../../hooks/useRecursiveTimeout';
import './GasWidget.css';

export interface GasWidgetProps {
  onGasPriceChanged: (gasPrice: number) => void
}

function GasWidget({onGasPriceChanged} : GasWidgetProps) {
  const [gwei, setGwei] = useState(0);
  const [ethPrice, setEthPrice] = useState(0);
  const [extraGas, setExtraGas] = useState(30);

  useRecursiveTimeout(async() => {
    const gasprice = await getCurrentGas();
    setGwei(gasprice.gas);
    setEthPrice(gasprice.price);

    onGasPriceChanged(gwei+extraGas);
  }, 3000);

  function onExtraGasChanged(gas: number) {
    setExtraGas(gas);
    onGasPriceChanged(gwei+extraGas);
  }

  return (
    <>
      <InputGroup className="mb-1">
        <InputGroup.Text>
          <img className='gas-widget__icon' alt="gas-icon" src='./img/gas-pump.svg' />
          <span className='gas-widget__gwei ms-2'>Fast: {gwei}</span>
        </InputGroup.Text>
        <Button 
          variant='info' 
          onClick={() => onExtraGasChanged(15)} 
          className={(extraGas === 15 ? ' gas-widget__input--active' : '')}
          >+ 15</Button>
        <Button 
          variant='info' 
          onClick={() => onExtraGasChanged(30)} 
          className={(extraGas === 30 ? ' gas-widget__input--active' : '')}
          >+ 30</Button>
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
            Max: {gwei + extraGas}
          </span>
        </InputGroup.Text>
      </InputGroup>
      <p className='gas-widget__estimate'>Estimate per txn: {ethers.utils.formatUnits(BigNumber.from((gwei+extraGas)*100000), 'gwei')} ETH</p>
    </>
  )
}

export default GasWidget
