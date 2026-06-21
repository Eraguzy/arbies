import { NextRequest } from 'next/server';
import { ZoDex } from '@/lib/funding/dexes/01';

export async function GET(request: NextRequest) {
  return ZoDex.GetCurrentFunding(request);
}