import { NextRequest, NextResponse } from 'next/server';
import { ZoApiUrl, ZoApiUrlEndpoints } from '../utils';
import { HTTPParams } from '@/app/api/req-params';
import { AssetAndFdg } from '../../utils';
import { ZoPairRegistry } from '@/lib/funding/dexes/01';
import { annualizeHourlyFunding } from '../../utils';
import { AssetValues } from '@/lib/funding/assets';

// get Zo ids based on the local pairs
// return format: [{ id: '0', ticker: 'BTCUSD' }, ...]
async function getIdsAndTickers(assets: AssetValues[]): Promise<Map<number, keyof typeof ZoPairRegistry>> {
  const res = await fetch(
    ZoApiUrl + ZoApiUrlEndpoints.info,
    {
      method: 'GET',
      // headers: { accept: 'application/json' },
    }
  );
  const data = await res.json();
  if (!data || !data.markets || data.markets.length === 0) {
    return new Map();
  }

  const ids: Map<number, keyof typeof ZoPairRegistry> = new Map();
  for (const listing of data.markets) {
    if (assets.includes(ZoPairRegistry[listing.symbol])) {
      ids.set(listing.marketId, listing.symbol);
    }
  }
  return ids;
}

// retrieve all coins ctx and keep the ones wanted
// we need to get the ids of the pairs to then get their fundings first
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const pairs: AssetValues[] = (searchParams.get(HTTPParams.assets)?.split(',') as AssetValues[]) || [];

  // get Zo ids
  const idsAndTickers = await getIdsAndTickers(pairs);
  const settled = await Promise.allSettled(
    idsAndTickers.entries().map(
      async ([id, ticker]) => {
        const res = await fetch(ZoApiUrl + ZoApiUrlEndpoints.stats(id), { method: 'GET' });
        const data = await res.json();
        if (!data?.perpStats?.funding_rate) return null;

        return {
          name: ZoPairRegistry[ticker], // get the local ticker name from id
          funding: annualizeHourlyFunding(data.perpStats.funding_rate), // it's already annualized as a rate in api
        } satisfies AssetAndFdg;
      }
    )
  );

  const assetsAndFundings = settled
    .filter((r): r is PromiseFulfilledResult<AssetAndFdg | null> => r.status === 'fulfilled') // keep only fulfilled promises
    .map(r => r.value) // keep values from promises
    .filter((v): v is AssetAndFdg => v !== null); // filter out null values

  return NextResponse.json(assetsAndFundings);
}