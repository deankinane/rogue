export interface AlertMessage {
  title: string
  message: string
  type: 'info' | 'success' | 'error'
}

export default function useToast() {

  function addToast(title:string, message: string, type: 'info' | 'success' | 'error') {
    window.dispatchEvent(new CustomEvent('rogue_toast', {detail :{
      title: title,
      message: message,
      type: type
    }}))
  }

  return addToast
}
