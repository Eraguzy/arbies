import { ArbiesAssets, AssetValues } from "@/lib/funding/assets"

// match paradex pairs with the local registry ; they are mapped by ids on the api
export const ParadexPairRegistry: Record<string, AssetValues> = {
  "BTC-USD-PERP": ArbiesAssets.BTC,
  "ETH-USD-PERP": ArbiesAssets.ETH,
  "SOL-USD-PERP": ArbiesAssets.SOL,
  "HYPE-USD-PERP": ArbiesAssets.HYPE
}