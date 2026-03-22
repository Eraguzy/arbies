import { ArbiesAssets, AssetValues } from "@/lib/funding/assets"

// match HL pairs with the local registry 
export const HLPairRegistry: { [key: string]: AssetValues } = {
  "BTC": ArbiesAssets.BTC,
  "ETH": ArbiesAssets.ETH,
  "SOL": ArbiesAssets.SOL,
  "HYPE": ArbiesAssets.HYPE
}