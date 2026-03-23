import { NextRequest, NextResponse } from 'next/server';
import { VariApiUrl, VariApiUrlEndpoints } from '../utils';
import { HTTPParams } from '@/app/api/req-params';
import { AssetAndFdg } from '../../utils';
import { VariPairRegistry } from '@/lib/funding/dexes/variational';

// retrieve all coins ctx and keep the ones wanted
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const pairs = searchParams.get(HTTPParams.assets)?.split(',') || [];

  const res = await fetch(
    VariApiUrl + VariApiUrlEndpoints.stats,
    {
      method: 'GET',
      headers: { accept: 'application/json' },
    }
  );
  const data = await res.json();
  if (!data || !data.listings || data.listings.length === 0) {
    return NextResponse.json({ error: 'No data found' }, { status: 404 });
  }

  // associate all assets with their funding
  // for extended we can alerady request the marekts we want => no filter
  const assetsAndFundings: AssetAndFdg[] = data.listings
    .filter((listing: any) => pairs.includes(VariPairRegistry[listing.ticker])) // keep only the pairs we want
    .map((universe: any) => {
      return {
        name: VariPairRegistry[universe.ticker],
        funding: universe.funding_rate * 100, // it's already annualized as a rate in api
      };
    });
  // filter the assets to keep only the ones wanted
  return NextResponse.json(assetsAndFundings);
}