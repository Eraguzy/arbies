import { NextRequest, NextResponse } from 'next/server';
import { PacificaApiUrl, PacificaApiUrlEndpoints } from '../utils';
import { HTTPParams } from '@/app/api/req-params';
import { AssetAndFdg, annualizeHourlyFunding } from '../../utils';
import { PacificaPairRegistry } from '@/lib/funding/dexes/pacifica';

// retrieve all coins ctx and keep the ones wanted
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const pairs = searchParams.get(HTTPParams.assets)?.split(',') || [];

  const res = await fetch(
    PacificaApiUrl + PacificaApiUrlEndpoints.marketInfo,
    {
      method: 'GET',
      headers: { accept: 'application/json' },
    }
  );
  const data = await res.json();
  if (!data || !data.data || data.data.length === 0) {
    return NextResponse.json({ error: 'No data found' }, { status: 404 });
  }
  if (!data.success) {
    return NextResponse.json({ error: 'Error fetching data from Pacifica' }, { status: 500 });
  }

  // associate all assets with their funding
  // for extended we can alerady request the marekts we want => no filter
  const assetsAndFundings: AssetAndFdg[] = data.data
    .filter((listing: any) => pairs.includes(PacificaPairRegistry[listing.symbol])) // keep only the pairs we want
    .map((universe: any) => {
      return {
        name: PacificaPairRegistry[universe.symbol],
        funding: annualizeHourlyFunding(universe.next_funding_rate), // convert to percentage
      };
    });
  // filter the assets to keep only the ones wanted
  return NextResponse.json(assetsAndFundings);
}