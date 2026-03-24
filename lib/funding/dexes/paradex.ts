import { ArbiesAssets, AssetValues } from "@/lib/funding/assets"

// match paradex pairs with the local registry ; they are mapped by ids on the api
export const ParadexPairRegistry: Record<string, AssetValues> = {
  "BTC-USD-PERP": ArbiesAssets.BTC,
  "ETH-USD-PERP": ArbiesAssets.ETH,
  "SOL-USD-PERP": ArbiesAssets.SOL,
  "HYPE-USD-PERP": ArbiesAssets.HYPE,
  "BERA-USD-PERP": ArbiesAssets.BERA,
  "SUI-USD-PERP": ArbiesAssets.SUI,
  "XRP-USD-PERP": ArbiesAssets.XRP,
  "WLFI-USD-PERP": ArbiesAssets.WLFI,
  "IP-USD-PERP": ArbiesAssets.IP,
  "XPL-USD-PERP": ArbiesAssets.XPL,
  "S-USD-PERP": ArbiesAssets.S,
  "JUP-USD-PERP": ArbiesAssets.JUP,
  "EIGEN-USD-PERP": ArbiesAssets.EIGEN,
  "APT-USD-PERP": ArbiesAssets.APT,
  "AAVE-USD-PERP": ArbiesAssets.AAVE,
  "KAITO-USD-PERP": ArbiesAssets.KAITO,
  "VIRTUAL-USD-PERP": ArbiesAssets.VIRTUAL,
  "ENA-USD-PERP": ArbiesAssets.ENA,
  "NEAR-USD-PERP": ArbiesAssets.NEAR,
  "ARB-USD-PERP": ArbiesAssets.ARB,
  "ZEC-USD-PERP": ArbiesAssets.ZEC,
  "ASTER-USD-PERP": ArbiesAssets.ASTER,
  "PAXG-USD-PERP": ArbiesAssets.PAXG,
  "LIT-USD-PERP": ArbiesAssets.LIT,
  "FARTCOIN-USD-PERP": ArbiesAssets.FARTCOIN,
}

// find key from value, return first elem
export function getParadexPair(asset: AssetValues): string | undefined {
  return Object.entries(ParadexPairRegistry).find(([_, value]) => value === asset)?.[0]
}