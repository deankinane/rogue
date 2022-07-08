import React from 'react'
import { Modal, Button } from 'react-bootstrap'

export interface ConfirmationDialogProps {
  show: boolean
  title: string
  message: string
  confirmButtonText?: string
  cancelButtonText?: string
  confirmCallback: () => void
  onHide: () => void
}
function ConfirmationDialog({show, title, message, confirmButtonText, cancelButtonText, confirmCallback, onHide}:ConfirmationDialogProps) {
  return (
    <Modal 
      show={show}
      onHide={onHide}
      centered
      backdrop='static'
      keyboard={false}>
      <Modal.Header closeButton>
        <Modal.Title>{title}</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <p>{message}</p>
      </Modal.Body>

      <Modal.Footer>
        <Button variant="dark" onClick={onHide}>{cancelButtonText || 'Cancel'}</Button>
        <Button variant="success" onClick={confirmCallback}>{confirmButtonText || 'OK'}</Button>
      </Modal.Footer>
    </Modal>
  )
}

export default ConfirmationDialog
