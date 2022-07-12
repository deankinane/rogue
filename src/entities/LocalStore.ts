export class LocalStore<T> {
  key: string
  initial: T

  constructor(key: string, initial: T) {
    this.key = key
    this.initial = initial
  }

  setData(data: T) {
    localStorage.setItem(this.key, JSON.stringify(data));
  }

  getData():T {
    let data: T = this.initial;

    const dataJson = localStorage.getItem(this.key);
    if (dataJson !== null) {
      data = JSON.parse(dataJson);
    }

    return data
  }
  
}
