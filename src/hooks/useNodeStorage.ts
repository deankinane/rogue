import INodeRecord from "../entities/INodeRecord";

export default function useNodeStorage(): [INodeRecord | undefined, (Node: INodeRecord) => void] {
  const ROGUE_STORAGE_NODE = 'ROGUE_STORAGE_NODE';

  function setNode(node: INodeRecord) {
    localStorage.setItem(ROGUE_STORAGE_NODE, JSON.stringify(node));
  }
  let node: INodeRecord | undefined;

  const NodeStorageJson = localStorage.getItem(ROGUE_STORAGE_NODE);
  if (NodeStorageJson !== null) {
    node = JSON.parse(NodeStorageJson);
  }
  
  return [node, setNode];

  //  return [{
  //   rpcUrl: 'https://api.zmok.io/testnet/3ki5uxoqm3thlxyl',
  //   chainId: 4
  // }, setNode]
}
