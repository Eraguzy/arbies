// app/api/hello/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { HLApiUrl } from '../utils';
import { HTTPParams } from '@/app/api/req-params';
import { annualizeHourlyFunding } from '../../utils';

export type AssetAndFdg = {
  name: string;
  funding: number;
};

// retrieve all coins ctx and keep the ones wanted
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const pairs = searchParams.get(HTTPParams.assets)?.split(',') || [];

  const res = await fetch(
    HLApiUrl,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: 'metaAndAssetCtxs',
        dex: '',
      }),
    }
  );
  const data = await res.json();
  if (!data || !data[0]) {
    return NextResponse.json({ error: 'No data found' }, { status: 404 });
  }

  // associate all assets with their funding
  const assetsAndFundings: AssetAndFdg[] = data[0].universe.map(
    (universe: any, index: number) => {
      return {
        name: universe.name,
        funding: annualizeHourlyFunding(data[1][index].funding),
      };
    });
  // filter the assets to keep only the ones wanted
  return NextResponse.json(assetsAndFundings.filter((asset) => pairs.includes(asset.name)));
}