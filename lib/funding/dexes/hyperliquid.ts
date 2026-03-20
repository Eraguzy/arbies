import { Assets, Collats, ArbiesPairRegistry, formatSlashPair, PairWithArbies } from "@/lib/funding/assets"

// match HL pairs with the local registry 
export const HLPairRegistry: PairWithArbies = {
  "BTC": ArbiesPairRegistry[formatSlashPair(Assets.BTC, Collats.USDC)],
  "ETH": ArbiesPairRegistry[formatSlashPair(Assets.ETH, Collats.USDC)],
  "SOL": ArbiesPairRegistry[formatSlashPair(Assets.SOL, Collats.USDC)],
  "HYPE": ArbiesPairRegistry[formatSlashPair(Assets.HYPE, Collats.USDC)]
}