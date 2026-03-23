import { ArbiesAssets, AssetValues } from "@/lib/funding/assets"

// match 01 pairs with the local registry ; they are mapped by ids on the api
export const ZoPairRegistry: Record<string, AssetValues> = {
	"BTCUSD": ArbiesAssets.BTC,
	"ETHUSD": ArbiesAssets.ETH,
	"SOLUSD": ArbiesAssets.SOL,
	"HYPEUSD": ArbiesAssets.HYPE,
	"BERAUSD": ArbiesAssets.BERA,
	"SUIUSD": ArbiesAssets.SUI,
	"XRPUSD": ArbiesAssets.XRP,
	"WLFIUSD": ArbiesAssets.WLFI,
	"IPUSD": ArbiesAssets.IP,
	"XPLUSD": ArbiesAssets.XPL,
	"SUSD": ArbiesAssets.S,
	"JUPUSD": ArbiesAssets.JUP,
	"EIGENUSD": ArbiesAssets.EIGEN,
	"APTUSD": ArbiesAssets.APT,
	"AAVEUSD": ArbiesAssets.AAVE,
	"KAITOUSD": ArbiesAssets.KAITO,
	"VIRTUALUSD": ArbiesAssets.VIRTUAL,
	"ENAUSD": ArbiesAssets.ENA,
	"NEARUSD": ArbiesAssets.NEAR,
	"ARBUSD": ArbiesAssets.ARB,
	"ZECUSD": ArbiesAssets.ZEC,
	"ASTERUSD": ArbiesAssets.ASTER,
	"PAXGUSD": ArbiesAssets.PAXG,
	"LITUSD": ArbiesAssets.LIT,
}
