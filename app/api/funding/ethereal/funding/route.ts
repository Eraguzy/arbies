import { NextRequest } from "next/server";
import { EtherealDex } from "@/lib/funding/dexes/ethereal";

export async function GET(request: NextRequest) {
  return EtherealDex.GetCurrentFunding(request);
}
