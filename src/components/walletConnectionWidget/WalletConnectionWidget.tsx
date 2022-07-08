import { useContext } from "react"
import { Button, InputGroup } from "react-bootstrap"
import { WalletFill } from "react-bootstrap-icons"
import { UserContext } from "../../application-state/userContext/UserContext"
import './WalletConnectionWidget.css'

export default function WalletConnectionWidget() {
  const {user, connectUser} = useContext(UserContext)

  async function connectButtonClick(event: React.MouseEvent<HTMLButtonElement>) {
    connectUser()
  }

  return (
    <div className='float-end wallet-connection-widget'>
      {
        user.connected
        ? (
          <InputGroup>
          <InputGroup.Text><WalletFill/></InputGroup.Text>
          <InputGroup.Text>{user.address.substring(0,6)}...</InputGroup.Text>
        </InputGroup>
        )
        : (
          <Button variant="success" onClick={connectButtonClick}>Connect Wallet</Button>
        )
      }
    </div>
  )
}
