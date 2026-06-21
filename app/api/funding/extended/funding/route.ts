import { NextRequest } from "next/server";
import { ExtndDex } from "@/lib/funding/dexes/extended";

export async function GET(request: NextRequest) {
  return ExtndDex.GetCurrentFunding(request);
}
