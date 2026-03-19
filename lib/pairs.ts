// match the pair format used by other exchanges with the local one

export const Assets = {
  BTC: "BTC",
  ETH: "ETH",
  SOL: "SOL",
  HYPE: "HYPE"
} as const

export const Collats = {
  USDC: "USDC",
  USDe: "USDe"
} as const

export type Pair = {
  asset: keyof typeof Assets
  collateral: keyof typeof Collats
}

export type PairRecord = Record<string, Pair>
export type PairWithArbies = Record<string, Pair>

function formatSlashPair(asset: keyof typeof Assets, collateral: keyof typeof Collats): string {
  return `${asset}/${collateral}`;
}

// locally storaged pairs, registery matched with their asset and collateral
export const ArbiesPairRegistry: PairRecord = {
  [formatSlashPair(Assets.BTC, Collats.USDC)]:
    { asset: Assets.BTC, collateral: Collats.USDC },
  [formatSlashPair(Assets.ETH, Collats.USDC)]:
    { asset: Assets.ETH, collateral: Collats.USDC },
  [formatSlashPair(Assets.SOL, Collats.USDC)]:
    { asset: Assets.SOL, collateral: Collats.USDC },
  [formatSlashPair(Assets.HYPE, Collats.USDC)]:
    { asset: Assets.HYPE, collateral: Collats.USDC }
}

// match HL pairs with the local registry 
export const HLPairRegistry: PairWithArbies = {
  "BTC": ArbiesPairRegistry[formatSlashPair(Assets.BTC, Collats.USDC)],
  "ETH": ArbiesPairRegistry[formatSlashPair(Assets.ETH, Collats.USDC)],
  "SOL": ArbiesPairRegistry[formatSlashPair(Assets.SOL, Collats.USDC)],
  "HYPE": ArbiesPairRegistry[formatSlashPair(Assets.HYPE, Collats.USDC)]
}

// match Lighter pairs with the local registry 
export const LighterPairRegistry: PairWithArbies = {
  "BTC": ArbiesPairRegistry[formatSlashPair(Assets.BTC, Collats.USDC)],
  "ETH": ArbiesPairRegistry[formatSlashPair(Assets.ETH, Collats.USDC)],
  "SOL": ArbiesPairRegistry[formatSlashPair(Assets.SOL, Collats.USDC)],
  "HYPE": ArbiesPairRegistry[formatSlashPair(Assets.HYPE, Collats.USDC)]
}