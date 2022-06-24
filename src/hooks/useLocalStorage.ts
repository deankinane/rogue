export default function useLocalStorage<T>(key: string): [T | null, (data: T) => void] {

  function setData(data: T) {
    localStorage.setItem(key, JSON.stringify(data));
  }
  let data: T | null = null;

  const dataJson = localStorage.getItem(key);
  if (dataJson !== null) {
    data = JSON.parse(dataJson);
  }
  
  return [data, setData];
}
