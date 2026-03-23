import { ArbiesAssets, AssetValues } from "@/lib/funding/assets"

// match Extended pairs with the local registry ; they are mapped by ids on the api
export const ExtndPairRegistry: Record<string, AssetValues> = {
  "BTC-USD": ArbiesAssets.BTC,
  "ETH-USD": ArbiesAssets.ETH,
  "SOL-USD": ArbiesAssets.SOL,
  "HYPE-USD": ArbiesAssets.HYPE,
  "GOOG_24_5-USD": ArbiesAssets.GOOGL,
  "AAPL_24_5-USD": ArbiesAssets.AAPL,
}

export function getExtendedPair(asset: AssetValues): string | undefined {
  return Object.entries(ExtndPairRegistry).find(([_, value]) => value === asset)?.[0]
}