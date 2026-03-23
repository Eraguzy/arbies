import { NextRequest, NextResponse } from 'next/server';
import { EtherealApiUrl, EtherealApiUrlEndpoints } from '../utils';
import { HTTPParams } from '@/app/api/req-params';
import { AssetAndFdg } from '../../utils';
import { EtherealPairRegistry } from '@/lib/funding/dexes/ethereal';
import { annualizeHourlyFunding } from '../../utils';
import { AssetValues } from '@/lib/funding/assets';

// get ethereal ids based on the local pairs
// return format: [{ id: '312bfacfb767', ticker: 'BTCUSD' }, ...]
async function getIdsAndTickers(assets: AssetValues[]): Promise<Record<string, keyof typeof EtherealPairRegistry>> {
  const res = await fetch(
    EtherealApiUrl + EtherealApiUrlEndpoints.product,
    {
      method: 'GET',
      headers: { accept: 'application/json' },
    }
  );
  const data = await res.json();
  if (!data || !data.data || data.data.length === 0) {
    return {};
  }

  const ids: Record<string, keyof typeof EtherealPairRegistry> = {};
  for (const listing of data.data) {
    if (assets.includes(EtherealPairRegistry[listing.ticker])) {
      ids[listing.id] = listing.ticker;
    }
  }
  return ids;
}

// retrieve all coins ctx and keep the ones wanted
// we need to get the ids of the pairs to then get their fundings first
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const pairs: AssetValues[] = (searchParams.get(HTTPParams.assets)?.split(',') as AssetValues[]) || [];

  // get ethereal ids
  const idsAndTickers = await getIdsAndTickers(pairs);

  const res = await fetch(
    EtherealApiUrl + EtherealApiUrlEndpoints.projectedFunding
    + '?productIds=' + Object.keys(idsAndTickers).join('&productIds='),
    {
      method: 'GET',
      headers: { accept: 'application/json' },
    }
  );
  const data = await res.json();
  if (!data || !data.data || data.data.length === 0) {
    return NextResponse.json({ error: 'No data found' }, { status: 404 });
  }

  // associate all assets with their funding
  const assetsAndFundings: AssetAndFdg[] = data.data
    .filter((listing: any) => pairs.includes(EtherealPairRegistry[idsAndTickers[listing.productId]]))
    .map((universe: any) => {
      return {
        name: EtherealPairRegistry[idsAndTickers[universe.productId]], // get the local ticker name from id
        funding: annualizeHourlyFunding(universe.fundingRateProjected1h), // it's already annualized as a rate in api
      };
    });
  // filter the assets to keep only the ones wanted
  return NextResponse.json(assetsAndFundings);
}