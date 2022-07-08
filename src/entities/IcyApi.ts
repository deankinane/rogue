import { CollectionDetails, NFT } from "./IWalletRecord";

const API_BASE_URL:string = 'https://graphql.icy.tools/graphql/';



interface GraphQLRequest {
  query: string
  variables: {}
}

async function loadCollectionDetails(address:string): Promise<CollectionDetails | null> {
  const request: GraphQLRequest = {
    query: `
    query TokenImages($address: String!) {
      contract(address: $address) {
        ... on ERC721Contract {
          unsafeOpenseaSlug
          unsafeOpenseaImageUrl
          name
          address
        }
      }
    }`,
    variables: {
      address: address
    }
  }

  const data = await queryApi(request);

  return {
    address: data.contract.address,
    name: data.contract.name,
    slug: data.contract.unsafeOpenseaSlug,
    logo: data.contract.unsafeOpenseaImageUrl,
    hidden: false
  }
}

async function loadTrendingMints(): Promise<any> {
  const request: GraphQLRequest = {
    query: `
    query TrendingMints($filter: TrendingMintsFilterInput) {
      trendingMints(filter: $filter) {
        ...TrendingMint
        __typename
      }
    }
    
    fragment TrendingMint on TrendingMint {
      count
      distinct
      firstMintedAt
      index
      sum
      distinctSum
      estMintCost
      avgTxFeeInEth
      avgGasPriceInGwei
      maxSupply
      address
      description
      discordUrl
      externalUrl
      imageUrl
      instagramUsername
      name
      slug
      symbol
      telegramUrl
      twitterUsername
      uuid
      icySlug
      deltaStats {
        count
        index
        __typename
      }
      __typename
    }
    `,
    variables: {
      filter: {"period":"FIFTEEN_MINUTES"}
    }
  }

  const data = await queryApi(request);
  debugger
  return data;
}


async function loadWalletContents(address:string, after?:string): Promise<NFT[]> {
  const request: GraphQLRequest = {
    query: `
    query Wallet($address: String, $after: String) {
      wallet(address: $address) {
        tokens(after: $after) {
          pageInfo {
            hasNextPage
          }
          edges {
            node {
              ... on ERC721Token {
                contract {
                  ... on ERC721Contract {
                    address
                    name
                    unsafeOpenseaSlug
                    unsafeOpenseaImageUrl
                  }
                }
                name
                images {
                  url
                  width
                }
                tokenId
              }
            }
            cursor
          }
        }
      }
    }`,
    variables: {
      address: address,
      after: after || ''
    }
  }

  const items = new Array<NFT>()

  const data = await queryApi(request)
  
  data.wallet.tokens.edges.forEach((x:any) => {
    let img = x.node.images.find((x:any) => x.width === 200);
    if (!img) {
      img = x.node.images.length > 0 ? x.node.images[0] : {url:''}
    }
    
    items.push({
      collection: {
        address: x.node.contract.address,
        name: x.node.contract.name,
        logo: x.node.contract.unsafeOpenseaImageUrl,
        slug: x.node.contract.unsafeOpenseaSlug,
        hidden: false
      },
      name: x.node.name,
      image: img.url,
      tokenId: x.node.tokenId
    })
  })

  if (data.wallet.tokens.pageInfo.hasNextPage) {
    const cursor = data.wallet.tokens.edges[data.wallet.tokens.edges.length - 1].cursor;
    await new Promise(r => setTimeout(r, 300));
    items.concat(await loadWalletContents(address, cursor))
  }

  return items
}

async function queryApi(request: GraphQLRequest) {
  const response = await fetch(API_BASE_URL, {
    method: 'POST',
    body: JSON.stringify(request),
    headers: {
      'x-api-key':'6d714bf210914089b3d172e45299ce8c',
      'content-type': 'application/json'
    }
  })

  if (response.status !== 200)
    throw new Error(`API Call Failed: ${response.statusText}`)

  return (await response.json()).data;
}

export {loadCollectionDetails, loadWalletContents, loadTrendingMints}
