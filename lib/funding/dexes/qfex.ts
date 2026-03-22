import { ArbiesAssets, AssetValues } from "@/lib/funding/assets"

// match QFEX pairs with the local registry ; they are mapped by ids on the api
export const QFEXPairRegistry: Record<string, AssetValues> = {
  "GOOGL": ArbiesAssets.GOOGL,
  "AAPL": ArbiesAssets.AAPL,
  "GBP/USD": ArbiesAssets.GBPUSD,
}