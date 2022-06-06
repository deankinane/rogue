import { Row, Col, InputGroup } from 'react-bootstrap'
import { ExclamationCircleFill } from 'react-bootstrap-icons'

export interface TransactionCounts {
  total: number,
  complete: number,
  failed: number,
  higherGas: number
}

export interface TransactionMonitorWidgetProps {
  counts: TransactionCounts
}

function TransactionMonitorWidget({counts} : TransactionMonitorWidgetProps) {
  
  return (
    <Row>
      <Col>
        <InputGroup className='mb-3'>
          <InputGroup.Text><ExclamationCircleFill className='mint-status-modal__icon me-2'/> {counts.higherGas} txns submitted with higher gas</InputGroup.Text>
        </InputGroup>
      </Col>
      <Col>
        <InputGroup className='mb-3 justify-content-end'>
          <InputGroup.Text>Pending: {counts.total - counts.complete}</InputGroup.Text>
          <InputGroup.Text>Failed: {counts.failed}</InputGroup.Text>
          <InputGroup.Text>Complete: {counts.complete}</InputGroup.Text>
        </InputGroup>
      </Col>
    </Row>
  )
}

export default TransactionMonitorWidget
