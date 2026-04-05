import { ArbiesAssets, AssetValues } from "@/lib/funding/assets"

// match Ethereal pairs with the local registry
export const EtherealPairRegistry: Record<string, AssetValues> = {
  "BTCUSD": ArbiesAssets.BTC,
  "ETHUSD": ArbiesAssets.ETH,
  "SOLUSD": ArbiesAssets.SOL,
  "HYPEUSD": ArbiesAssets.HYPE,
  "SUIUSD": ArbiesAssets.SUI,
  "XRPUSD": ArbiesAssets.XRP,
  "AAVEUSD": ArbiesAssets.AAVE,
  "ENAUSD": ArbiesAssets.ENA,
  "FARTCOINUSD": ArbiesAssets.FARTCOIN,
  "PUMPUSD": ArbiesAssets.PUMP,
  "ZECUSD": ArbiesAssets.ZEC,
  "MONUSD": ArbiesAssets.MON,
  "XMRUSD": ArbiesAssets.XMR,
  "LITUSD": ArbiesAssets.LIT,
  "BERAUSD": ArbiesAssets.BERA,
}