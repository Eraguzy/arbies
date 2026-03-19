import { NextResponse } from "next/server"
import { ArbiesPairRegistry } from "@/lib/pairs"

export async function GET() {
  return NextResponse.json(ArbiesPairRegistry)
}