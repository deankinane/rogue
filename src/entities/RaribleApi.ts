const API_BASE_URL = 'https://api.rarible.org/v0.1/';

async function getItemsByOwner(wallet: string, collection: string): Promise<any[]> {
  const response = await fetch(`${API_BASE_URL}items/byOwner?owner=ETHEREUM:${wallet}`)
  if(response.status !== 200) {
    throw new Error('Unable to load wallet contents')
  }

  const json = await response.json();
  
  return json.items.filter((x:any) => x.collection === `ETHEREUM:${collection}`);
}

export {getItemsByOwner}
