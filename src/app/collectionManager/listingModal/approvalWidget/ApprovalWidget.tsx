import { ethers, BigNumber } from 'ethers'
import React, { useEffect, useRef, useState } from 'react'
import { Spinner, InputGroup, Button, FormControl } from 'react-bootstrap'
import { useSettingsStore } from '../../../../application-state/settingsStore/SettingsStore'
import { IWallet } from '../../../../application-state/walletStore/WalletInterface'
import getCurrentGas from '../../../../entities/GasNowApi'
import { estimateGasForApproval, isApprovedForAll, setApprovalForAll } from '../../../../entities/X2Y2'
import { TransactionReceipt } from "@ethersproject/providers";
import useToast from '../../../../hooks/useToast'
import './ApprovalWidget.css'

interface ApprovalWidgetProps {
  wallets: IWallet[]
  address: string
  init: boolean
  initCallback: () => void
  onAllApproved: () => void
}
function ApprovalWidget({wallets, address, init, initCallback, onAllApproved}: ApprovalWidgetProps) {
  const {settings} = useSettingsStore()
  const [needsApproval, setNeedsApproval] = useState<IWallet[]>([])
  const [checkingApprovals, setCheckingApprovals] = useState(true)
  const [estimatedGas, setEstimatedGas] = useState(0)
  const [gwei, setGwei] = useState(0)
  const [maxFee, setMaxFee] = useState(0)
  const [prioFee, setPrioFee] = useState(1.5)
  const [approving, setApproving] = useState(false)
  const gasTimer = useRef<NodeJS.Timer>()
  const sendToast = useToast()
  

  useEffect(() => {
    if(init) {
      checkIfWalletsNeedApproval(wallets)
      initCallback()
    }

    gasTimer.current = setInterval(async () => {
      const gasprice = await getCurrentGas();
      setGwei(gasprice.base);
      if (maxFee === 0) setMaxFee(gasprice.base+5)
    }, 3000)
    
    return () => {
      clearInterval(gasTimer.current)
    }
  },[init, wallets])

  async function checkIfWalletsNeedApproval(colWallets: IWallet[]) {
    setCheckingApprovals(x => true)
    const toBeApproved = new Array<IWallet>()

    for(let i=0; i<colWallets.length; i++) {
      if (!await isApprovedForAll(colWallets[i], address, settings.node)) {
        toBeApproved.push(colWallets[i])
      }
    }

    setNeedsApproval(x => toBeApproved)

    if (toBeApproved.length > 0) {
      const gas = await estimateGasForApproval(toBeApproved[0], address, settings.node)
      setEstimatedGas(gas)
    }
    else {
      onAllApproved()
    }
    setCheckingApprovals(x => false)
  }

  async function onApproveClicked() {
    setApproving(true)
    
    const txns = new Array<Promise<TransactionReceipt>>()

    for (let i = 0; i < needsApproval.length; i++) {
      const wallet = needsApproval[i];
      let tr = await setApprovalForAll(wallet, address, settings.node, maxFee, prioFee)
      txns.push(tr.wait())
    }

    const done = await Promise.allSettled(txns);
    let allDone = true;
    
    done.forEach(r => {
      if (r.status === 'rejected') {
        allDone = false
      }
    })

    setApproving(false)

    if(!allDone) {
      sendToast('Wallet Approval Failed', 'One or more wallets could not be approved', 'error')
      checkIfWalletsNeedApproval(wallets)
      return
    }

    setNeedsApproval([])
    onAllApproved()
  }

  return (
    <>
    { !checkingApprovals ? <></> : 
    
      <div className='d-flex align-items-center'>
        <div className='listing-modal_approvals_content'>
          <div className='d-flex align-items-center h-100'>
            <Spinner animation='border' className='me-4' /> <p className='m-0'>Checking wallet approvals...</p>
          </div>
        </div>
      </div>
    
    }

    { checkingApprovals ? <></> :
      <div className='listing-modal_approvals_content d-block'>
        <div className='d-flex align-items-center mb-2'>
          {needsApproval.length} Wallet Approvals Needed
        </div>
          <div className='d-flex me-3 mb-2 pt-2'>
              <div className='d-flex'>
                <InputGroup.Text className='me-2'>
                  <img className='gas-widget__icon' alt="gas-icon" src='./img/gas-pump.svg' />
                  <span className='gas-widget__gwei ms-2'>Base: {gwei}</span>
                </InputGroup.Text>
                <InputGroup className='listing-modal_approvals_gas me-2'>
                  <InputGroup.Text>
                    Max Fee
                  </InputGroup.Text>
                  <FormControl 
                    type='number' 
                    min={1}
                    step={5}
                    value={maxFee}
                    className='listing-modal_approvals_gas_input'
                    onChange={v => setMaxFee(parseInt(v.currentTarget.value))}
                    />
                </InputGroup>
                <InputGroup className='listing-modal_approvals_gas'>
                  <InputGroup.Text>
                    Priority Fee
                  </InputGroup.Text>
                  <FormControl 
                    type='number' 
                    min={0.1}
                    step={0.5}
                    value={prioFee}
                    className='listing-modal_approvals_gas_input'
                    onChange={v => setPrioFee(parseFloat(v.currentTarget.value))}
                    />
                </InputGroup>
                
              </div>
              
            </div> 
            <div className='d-flex justify-content-start '>
              <InputGroup className='w-auto me-2'>
                <InputGroup.Text><>Estimated {parseFloat(ethers.utils.formatUnits(BigNumber.from(maxFee*estimatedGas), 'gwei')).toFixed(4)} ETH per wallet</></InputGroup.Text>
              </InputGroup>
              <InputGroup className='w-auto me-2'>
                <InputGroup.Text className='fw-bold'><>Total {parseFloat(ethers.utils.formatUnits(BigNumber.from(maxFee*estimatedGas*needsApproval.length), 'gwei')).toFixed(4)} ETH</></InputGroup.Text>
              </InputGroup>
              <Button 
                  style={{'width':'114px'}}
                  variant='info' 
                  onClick={onApproveClicked}
                  >{approving ? <Spinner size='sm' animation="border" /> : <>Approve All</>}</Button>
            </div>         
        </div>
    }
      
    </>
  )
}

export default ApprovalWidget
