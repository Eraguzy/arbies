// app/api/hello/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { HLApiUrl } from '../utils';
import { HTTPParams } from '@/app/api/req-params';

// retrieve all coins ctx and keep the ones wanted
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const pairs = searchParams.get(HTTPParams.assets)?.split(',') || [];

  const res = await fetch(HLApiUrl,
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
  return NextResponse.json(data[0].universe[1], data[1][1]);
}