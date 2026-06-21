import { NextRequest } from "next/server";
import { ParadexDex } from "@/lib/funding/dexes/paradex";

export async function GET(request: NextRequest) {
  return ParadexDex.GetCurrentFunding(request);
}
