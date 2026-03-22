import { ArbiesAssets, AssetValues } from "@/lib/funding/assets"

// match Lighter pairs with the local registry 
export const LighterPairRegistry: Record<string, AssetValues> = {
  "BTC": ArbiesAssets.BTC,
  "ETH": ArbiesAssets.ETH,
  "SOL": ArbiesAssets.SOL,
  "HYPE": ArbiesAssets.HYPE
}