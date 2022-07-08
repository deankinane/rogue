export default function useLocalStorage<T>(key: string, intial:T): [T, (data: T) => void] {

  function setData(data: T) {
    localStorage.setItem(key, JSON.stringify(data));
  }
  let data: T = intial;

  const dataJson = localStorage.getItem(key);
  if (dataJson !== null) {
    data = JSON.parse(dataJson);
  }
  
  return [data, setData];
}
