import { NextRequest } from "next/server";
import { PacificaDex } from "@/lib/funding/dexes/pacifica";

export async function GET(request: NextRequest) {
  return PacificaDex.GetCurrentFunding(request);
}
