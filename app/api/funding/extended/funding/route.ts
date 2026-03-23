import { NextRequest, NextResponse } from 'next/server';
import { ExtndApiUrl, ExtndApiUrlEndpoints } from '../utils';
import { HTTPParams } from '@/app/api/req-params';
import { annualizeHourlyFunding, AssetAndFdg } from '../../utils';
import { ExtndPairRegistry, getExtendedPair } from '@/lib/funding/dexes/extended';
import { AssetValues } from '@/lib/funding/assets';

// retrieve all coins ctx and keep the ones wanted
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const pairs = searchParams.get(HTTPParams.assets)?.split(',') || [];
  // format to extended pairs
  let extndPairs: string[] = [];
  for (const pair of pairs) {
    if (getExtendedPair((pair as AssetValues))) {
      extndPairs.push(getExtendedPair((pair as AssetValues)) ?? '');
    } else {
      continue
    }
  }
  if (extndPairs.length === 0) {
    return NextResponse.json({ error: 'no valid pairs provided' }, { status: 400 });
  }

  const res = await fetch(
    ExtndApiUrl + ExtndApiUrlEndpoints.markets
    + '?market=' + extndPairs.join('&market='),
    {
      method: 'GET',
      headers: { accept: 'application/json' },
    }
  );
  const data = await res.json();
  if (data.status !== 'ok' && data.status !== 'OK') {
    return NextResponse.json({ error: 'status is invalid' }, { status: 500 });
  }
  if (!data || !data.data || data.data.length === 0) {
    return NextResponse.json({ error: 'No data found' }, { status: 404 });
  }

  // associate all assets with their funding
  // for extended we can alerady request the marekts we want => no filter
  const assetsAndFundings: AssetAndFdg[] = data.data.map((universe: any) => {
    return {
      name: ExtndPairRegistry[universe.name],
      funding: annualizeHourlyFunding(universe.marketStats.fundingRate),
    };
  });
  // filter the assets to keep only the ones wanted
  return NextResponse.json(assetsAndFundings);
}