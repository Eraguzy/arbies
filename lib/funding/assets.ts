export const ArbiesAssets = {
  //crypto
  BTC: "BTC",
  ETH: "ETH",
  SOL: "SOL",
  HYPE: "HYPE",
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
  WLFI: "WLFI",
  IP: "IP",
  XPL: "XPL",
  S: "S",
  JUP: "JUP",
  EIGEN: "EIGEN",
  APT: "APT",
  KAITO: "KAITO",
  VIRTUAL: "VIRTUAL",
  NEAR: "NEAR",
  ARB: "ARB",
  ASTER: "ASTER",
  PAXG: "PAXG",
  //stocks
  GOOGL: "GOOGL",
  AAPL: "AAPL",
  //forex
  GBPUSD: "GBPUSD",
  //commodities
} as const


export type AssetValues = typeof ArbiesAssets[keyof typeof ArbiesAssets]

export const ArbiesCollats = {
  USDC: "USDC",
  USDe: "USDe"
} as const

export type CollatValues = typeof ArbiesCollats[keyof typeof ArbiesCollats]
