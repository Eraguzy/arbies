import { NextRequest } from "next/server";
import { QFEXDex } from "@/lib/funding/dexes/qfex";

export async function GET(request: NextRequest) {
  return QFEXDex.GetCurrentFunding(request);
}
