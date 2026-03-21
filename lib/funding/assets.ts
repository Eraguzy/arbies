export const Assets = {
  BTC: "BTC",
  ETH: "ETH",
  SOL: "SOL",
  HYPE: "HYPE"
} as const

export type AssetValues = typeof Assets[keyof typeof Assets]

export const Collats = {
  USDC: "USDC",
  USDe: "USDe"
} as const

export type CollatValues = typeof Collats[keyof typeof Collats]

export type Pair = {
  asset: AssetValues
  collateral: CollatValues
}

export type PairRecord = Record<string, Pair>
export type PairWithArbies = Record<string, Pair>

export function formatSlashPair(
  asset: AssetValues,
  collateral: CollatValues
): string {
  return `${asset}/${collateral}`;
}

export function formatSlashPair2(pair: Pair): string {
  return `${pair.asset}/${pair.collateral}`;
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