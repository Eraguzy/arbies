import { NextRequest } from "next/server";
import { LighterDex } from "@/lib/funding/dexes/lighter";

export async function GET(request: NextRequest) {
  return LighterDex.GetCurrentFunding(request);
}
