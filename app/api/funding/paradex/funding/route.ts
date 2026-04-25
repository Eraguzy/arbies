
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

  const settled = await Promise.allSettled(
    pairs.map(async (pair) => {
      const res = await fetch(
        ParadexApiUrl + ParadexApiUrlEndpoints.funding + '?market=' + getParadexPair(pair),
        { method: 'GET', headers: { accept: 'application/json' } }
      );
      const data = await res.json();
      if (!data?.results?.length) return null;

      return {
        name: pair,
        funding: annualize8HourlyFunding(data.results[0].funding_rate),
      } satisfies AssetAndFdg;
    })
  );

  const assetsAndFundings = settled
    .filter((r): r is PromiseFulfilledResult<AssetAndFdg | null> => r.status === 'fulfilled') // keep only fulfilled promises
    .map(r => r.value)// keep values from promises
    .filter((v): v is AssetAndFdg => v !== null); // filter out null values
  return NextResponse.json(assetsAndFundings);
}