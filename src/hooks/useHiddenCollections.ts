import useLocalStorage from "./useLocalStorage";

export default function useHiddenCollections() : [Array<string>, (collections: Array<string>) => void] {
  const ROGUE_STORAGE_HIDDENCOLLECTIONS = 'ROGUE_STORAGE_HIDDENCOLLECTIONS';

  const [collections, setCollections] = useLocalStorage<string[]>(ROGUE_STORAGE_HIDDENCOLLECTIONS);

  return [collections || new Array<string>(), setCollections]
}
