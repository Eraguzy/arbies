export const ArbiesAssets = {
  BTC: "BTC",
  ETH: "ETH",
  SOL: "SOL",
  HYPE: "HYPE",
  GOOGL: "GOOGL",
  AAPL: "AAPL",
  GBPUSD: "GBPUSD",
  SUI: "SUI",
  XRP: "XRP",
  AAVE: "AAVE",
  ENA: "ENA",
  FARTCOIN: "FARTCOIN",
  PUMP: "PUMP",
  ZEC: "ZEC",
  MON: "MON",
  XMR: "XMR",
  LIT: "LIT",
  BERA: "BERA",
} as const

export type AssetValues = typeof ArbiesAssets[keyof typeof ArbiesAssets]

export const ArbiesCollats = {
  USDC: "USDC",
  USDe: "USDe"
} as const

export type CollatValues = typeof ArbiesCollats[keyof typeof ArbiesCollats]
