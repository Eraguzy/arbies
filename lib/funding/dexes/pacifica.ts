import { ArbiesAssets, AssetValues } from "@/lib/funding/assets"

// match pacifica pairs with the local registry ; they are mapped by ids on the api
export const PacificaPairRegistry: Record<string, AssetValues> = {
    "BTC": ArbiesAssets.BTC,
    "ETH": ArbiesAssets.ETH,
    "SOL": ArbiesAssets.SOL,
    "HYPE": ArbiesAssets.HYPE,
    "GOOGL": ArbiesAssets.GOOGL,
}