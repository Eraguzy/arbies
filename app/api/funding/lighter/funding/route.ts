import { NextRequest, NextResponse } from 'next/server';
import { LgtrApiUrl, LgtrApiUrlEndpoints } from '../utils';
import { HTTPParams } from '@/app/api/req-params';
import { annualize8HourlyFunding, AssetAndFdg } from '../../utils';
import { AllDexes } from '@/lib/funding/dexes/arbies';
import { LighterPairRegistry } from '@/lib/funding/dexes/lighter';

// retrieve all coins ctx and keep the ones wanted
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const pairs = searchParams.get(HTTPParams.assets)?.split(',') || [];

  const res = await fetch(
    LgtrApiUrl + LgtrApiUrlEndpoints.fundingRates,
    {
      method: 'GET',
      headers: { accept: 'application/json' },
    }
  );
  const data = await res.json();
  if (!data) {
    return NextResponse.json({ error: 'No data found' }, { status: 404 });
  }

  // associate all assets with their funding
  const assetsAndFundings: AssetAndFdg[] = data.funding_rates
    .filter((universe: any) =>
      universe.exchange.toLowerCase() === AllDexes.Lighter.toLowerCase() &&
      pairs.includes(LighterPairRegistry[universe.symbol])
    )
    .map(
      (universe: any) => {
        return {
          name: LighterPairRegistry[universe.symbol],
          funding: annualize8HourlyFunding(universe.rate),
        };
      });
  // filter the assets to keep only the ones wanted
  return NextResponse.json(assetsAndFundings);
}