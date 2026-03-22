export const ArbiesAssets = {
  BTC: "BTC",
  ETH: "ETH",
  SOL: "SOL",
  HYPE: "HYPE",
  GOOGL: "GOOGL",
  AAPL: "AAPL",
  GBPUSD: "GBPUSD",
} as const

export type AssetValues = typeof ArbiesAssets[keyof typeof ArbiesAssets]

export const ArbiesCollats = {
  USDC: "USDC",
  USDe: "USDe"
} as const

export type CollatValues = typeof ArbiesCollats[keyof typeof ArbiesCollats]
