import INodeRecord from "../entities/INodeRecord";

export default function useNodeStorage(): [INodeRecord[], (Nodes: INodeRecord[]) => void] {
  const ROGUE_STORAGE_NODES = 'ROGUE_STORAGE_NodeS';

  function setNodes(Nodes: INodeRecord[]) {
    localStorage.setItem(ROGUE_STORAGE_NODES, JSON.stringify(Nodes));
  }
  let Nodes: INodeRecord[] = [];

  const NodeStorageJson = localStorage.getItem(ROGUE_STORAGE_NODES);
  if (NodeStorageJson !== null) {
    Nodes = JSON.parse(NodeStorageJson);
  }
  
  return [Nodes, setNodes];
}
