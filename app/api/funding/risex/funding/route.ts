import { NextRequest } from "next/server";
import { RisexDex } from "@/lib/funding/dexes/risex";

export async function GET(request: NextRequest) {
  return RisexDex.GetCurrentFunding(request);
}
