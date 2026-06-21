import { NextRequest } from "next/server";
import { HLDex } from "@/lib/funding/dexes/hyperliquid";

export async function GET(request: NextRequest) {
  return HLDex.GetCurrentFunding(request);
}
