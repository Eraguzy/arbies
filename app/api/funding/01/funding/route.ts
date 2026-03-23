import { NextRequest, NextResponse } from 'next/server';
import { ZoApiUrl, ZoApiUrlEndpoints } from '../utils';
import { HTTPParams } from '@/app/api/req-params';
import { AssetAndFdg } from '../../utils';
import { ZoPairRegistry } from '@/lib/funding/dexes/01';
import { annualizeHourlyFunding } from '../../utils';
import { AssetValues } from '@/lib/funding/assets';

// get Zo ids based on the local pairs
// return format: [{ id: '312bfacfb767', ticker: 'BTCUSD' }, ...]
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

  let assetsAndFundings = [] as AssetAndFdg[];
  // fetch the funding for each pair based on their id
  for (const [idt, ticker] of idsAndTickers) {
    const res = await fetch(
      ZoApiUrl + ZoApiUrlEndpoints.stats(idt),
      {
        method: 'GET',
        // headers: { accept: 'application/json' },
      }
    );
    const data = await res.json();
    if (!data) return NextResponse.json({ error: 'No data found' }, { status: 404 });

    const local: AssetAndFdg = {
      name: ZoPairRegistry[ticker], // get the local ticker name from id
      funding: annualizeHourlyFunding(data.perpStats.funding_rate), // it's already annualized as a rate in api
    }
    assetsAndFundings.push(local);
  }

  return NextResponse.json(assetsAndFundings);
}