
import { NextRequest, NextResponse } from 'next/server';
import { ParadexApiUrl, ParadexApiUrlEndpoints } from '../utils';
import { HTTPParams } from '@/app/api/req-params';
import { AssetAndFdg, annualize8HourlyFunding } from '../../utils';
import { getParadexPair } from '@/lib/funding/dexes/paradex';
import { AssetValues } from '@/lib/funding/assets';

// retrieve all coins ctx and keep the ones wanted
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const pairs: AssetValues[] = searchParams.get(HTTPParams.assets)?.split(',') as AssetValues[] || [];

  let assetsAndFundings: AssetAndFdg[] = [];
  for (const pair of pairs) {
    const res = await fetch(
      ParadexApiUrl + ParadexApiUrlEndpoints.funding
      + "?market=" + getParadexPair(pair),
      {
        method: 'GET',
        headers: { accept: 'application/json' },
      }
    );
    const data = await res.json();

    if (!data || !data.results) {
      return NextResponse.json({ error: 'No data found' }, { status: 404 });
    }
    if (data.results.length === 0) continue

    assetsAndFundings.push({
      name: pair,
      funding: annualize8HourlyFunding(data.results[0].funding_rate), // take the first one, should be the most recent
    });
  }

  return NextResponse.json(assetsAndFundings);
}