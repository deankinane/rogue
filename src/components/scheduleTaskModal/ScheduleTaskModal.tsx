import React, { PropsWithChildren, useState } from 'react'
import { Modal, Row, Col, Button } from 'react-bootstrap'
import { Bullseye, ClockFill, Speedometer2 } from 'react-bootstrap-icons';
import { TransactionState } from '../../entities/GlobalState'
import MintContract from '../../entities/MintContract';
import { BackrunTriggerSettings, TriggerType } from '../../entities/ScheduledTasks';
import BackrunTriggerForm from './backrunTrigger/BackrunTriggerForm';
import './ScheduleTaskModal.css';
import TargetValueForm from './targetValue/TargetValueForm';
import TimeTriggerForm from './timeTrigger/TimeTriggerForm';

export interface ScheduleTaskModalProps extends PropsWithChildren<any> {
  show: boolean
  onHide: () => void
  transactionState: TransactionState,
  contract?: MintContract
}

function ScheduleTaskModal({show, onHide, transactionState, contract}: ScheduleTaskModalProps) {
  const [triggerType, setTriggerType] = useState<TriggerType>()

  function closeModal() {
    onHide();
  }

  function buttonActiveClass(type: TriggerType): string {
    return type === triggerType ? ' active' : '';
  }

  function onSettingsUpdate(settings: BackrunTriggerSettings){
    
  }
  
  return (
    <Modal
      show={show}
      size='lg'
      backdrop='static'
      centered
    >
      <Modal.Header>
        <Modal.Title>
          Schedule Mint Task
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p className='modal-section__title mb-1'>Choose Trigger Type</p>
        <div className='d-flex align-items-stretch'>  
          <Row className='g-2 mt-2'>
            <Col xs={12} xl={4}>
              <div className={'task-trigger-type-button h-100' + buttonActiveClass(TriggerType.backrun)} onClick={() => setTriggerType(TriggerType.backrun)}>
                <div className='task-trigger-type-button_title mb-2'><Speedometer2 className='me-3' size='20'/><span>Backrun Function</span></div>
                <p>Monitor the contract for a function call and attempt to queue transactions immediately afterwards in the same block.</p>
              </div>
            </Col>
            <Col xs={12} xl={4}>
              <div className={'task-trigger-type-button h-100' + buttonActiveClass(TriggerType.value)} onClick={() => setTriggerType(TriggerType.value)}>
                <div className='task-trigger-type-button_title mb-2'><Bullseye className='me-3' size='20'/><span>Target Value</span></div>
                <p>Monitor a value on the contract and submit transactions when the a target value
                  is reached.
                </p>
              </div>
            </Col>
            <Col xs={12} xl={4}>
              <div className={'task-trigger-type-button h-100' + buttonActiveClass(TriggerType.time)} onClick={() => setTriggerType(TriggerType.time)}>
                <div className='task-trigger-type-button_title mb-2'><ClockFill className='me-3' size='20'/><span>Time Trigger</span></div>
                <p>Submit transactions at a certain date and time.
                </p>
              </div>
            </Col>
          </Row>
        </div>
        <div className="modal-section mt-3">
          {
            triggerType === TriggerType.backrun ?
            <BackrunTriggerForm contract={contract} onSettingsUpdate={onSettingsUpdate} />
            : <></>
          }
          {
            triggerType === TriggerType.value ?
            <TargetValueForm contract={contract} />
            : <></>
          }
          {
            triggerType === TriggerType.time ?
            <TimeTriggerForm contract={contract} />
            : <></>
          }
        </div>
        
      </Modal.Body>
      <Modal.Footer>
        <Button variant='dark' className='float-end' onClick={closeModal}>Cancel</Button>
        <Button variant='info' className='float-end' onClick={closeModal}>Schedule Task</Button>
      </Modal.Footer>
    </Modal>
  )
}

export default ScheduleTaskModal;
