import { NextRequest } from "next/server";
import { VariDex } from "@/lib/funding/dexes/variational";

export async function GET(request: NextRequest) {
  return VariDex.GetCurrentFunding(request);
}
