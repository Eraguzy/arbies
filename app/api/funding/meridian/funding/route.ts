import { NextRequest } from "next/server";
import { MeridianDex } from "@/lib/funding/dexes/meridian";

export async function GET(request: NextRequest) {
  return MeridianDex.GetCurrentFunding(request);
}
