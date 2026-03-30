import { NextRequest, NextResponse } from 'next/server';
import { QfexApiUrl, QfexApiUrlEndpoints } from '../utils';
import { HTTPParams } from '@/app/api/req-params';
import { annualize8HourlyFunding, AssetAndFdg } from '../../utils';
import { QFEXPairRegistry } from '@/lib/funding/dexes/qfex';

// retrieve all coins ctx and keep the ones wanted
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const pairs = searchParams.get(HTTPParams.assets)?.split(',') || [];

  const res = await fetch(
    QfexApiUrl + QfexApiUrlEndpoints.symbolsMetrics,
    {
      method: 'GET',
      headers: { accept: 'application/json' },
    }
  );
  const data = await res.json();
  if (!data || !data.data) {
    return NextResponse.json({ error: 'No data found' }, { status: 404 });
  }
  const fundingData: AssetAndFdg[] = [];
  for (const pairData of data.data) {
    if (QFEXPairRegistry[pairData.symbol]) {
      fundingData.push({
        name: QFEXPairRegistry[pairData.symbol],
        funding: pairData.funding_rate_bps * 100 // bps to %,
      });
    }
  }

  return NextResponse.json(fundingData);
}