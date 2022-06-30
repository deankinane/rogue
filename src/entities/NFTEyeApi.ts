const BaseUrl: string = 'https://api.nfteye.io/api/v1/';

export interface CollectionDetails {
  name: string
  slug: string
  logo: string
}
async function loadCollectionDetails(address:string): Promise<CollectionDetails | null> {
  const result = await fetch(`${BaseUrl}/search?keyword=${address}`)
  const json = await result.json();

  if (json.data[0].collections.length > 0)
    return json.data[0].collections[0] as CollectionDetails
  else
    return null;
}

export {loadCollectionDetails}
