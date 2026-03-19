import { NextResponse } from "next/server"
import { Pair } from "@/lib/pairs"

export async function GET() {
  const pairs: Pair[] = [
    { asset: "BTC", collateral: "USDC" },
    { asset: "ETH", collateral: "USDC" },
    { asset: "HYPE", collateral: "USDC" },
    { asset: "SOL", collateral: "USDC" },
  ]

  return NextResponse.json(pairs)
}