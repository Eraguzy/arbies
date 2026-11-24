import { NextRequest, NextResponse } from 'next/server';

import { ArbiesAssets, AssetValues } from "@/lib/funding/assets"
import type { Dex } from "@/lib/funding/dexes/arbies"
import { HTTPParams } from '@/app/api/req-params';
import { AssetAndFdg } from "@/app/api/funding/utils"
import { annualizeHourlyFunding } from '@/app/api/funding/utils';
import { wait, DexApiError, fetchDexJSON, settledToFundings, dexErrorCatcher } from '@/lib/funding/misc';

// match 01 pairs with the local registry ; they are mapped by ids on the api
const ZoPairRegistry: Record<string, AssetValues> = {
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
	"PUMPUSD": ArbiesAssets.PUMP,
	"WLDUSD": ArbiesAssets.WLD,
	"TAOUSD": ArbiesAssets.TAO,
	"DOGEUSD": ArbiesAssets.DOGE,
	"BNBUSD": ArbiesAssets.BNB,
	"UNIUSD": ArbiesAssets.UNI,
	"ONDOUSD": ArbiesAssets.ONDO,
	"PENGUUSD": ArbiesAssets.PENGU,
	"kPEPEUSD": ArbiesAssets.PEPE,
	"FARTCOINUSD": ArbiesAssets.FARTCOIN,
	"MONUSD": ArbiesAssets.MON,
	"VVVUSD": ArbiesAssets.VVV,
	"ZROUSD": ArbiesAssets.ZRO,
	"MORPHOUSD": ArbiesAssets.MORPHO,
	"AEROUSD": ArbiesAssets.AERO,
	"XMRUSD": ArbiesAssets.XMR,
	"NVDAUSD": ArbiesAssets.NVDA,
}

const ZoApiUrl = "https://zo-mainnet.n1.xyz";

const ZoApiUrlEndpoints = {
	info: "/info", // contains ticker, id
	stats: (id: number) => `/market/${id}/stats`, // contains funding rate
}

// api req throttling, supposedly 100 req/sec
const ZoFetchTimestamps: number[] = [];
async function ZoFetchoor(url: string, options: RequestInit) {
	const ZoApiRatePerSec = 100; // hypothetic, undocumented
	const ZoApiRateMs = 1000;
	const ZoApiTimeoutMs = 5000;

	while (true) {
		const now = Date.now();

		while (ZoFetchTimestamps.length > 0 && ZoFetchTimestamps[0] <= now - ZoApiRateMs) { // clean old timestamps
			ZoFetchTimestamps.shift();
		}

		if (ZoFetchTimestamps.length < ZoApiRatePerSec) { // if under rate limit, fetch
			ZoFetchTimestamps.push(now);
			return fetchDexJSON(ZoDex.Name, url, options, ZoApiTimeoutMs);
		}

		await wait(ZoApiRateMs - (now - ZoFetchTimestamps[0])); // wait until oldest is out rate limit window
	}
}

// get Zo ids based on the local pairs
// return format: [{ id: '0', ticker: 'BTCUSD' }, ...]
async function getIdsAndTickers(assets: AssetValues[]): Promise<Map<number, keyof typeof ZoPairRegistry>> {
	return ZoFetchoor(
		ZoApiUrl + ZoApiUrlEndpoints.info,
		{ method: 'GET' },
	).then(data => {
		if (!data || !Array.isArray(data.markets)) {
			throw new DexApiError(ZoDex.Name, ZoApiUrl + ZoApiUrlEndpoints.info, "invalid-data");
		}

		const ids: Map<number, keyof typeof ZoPairRegistry> = new Map();
		for (const listing of data.markets) {
			if (assets.includes(ZoPairRegistry[listing.symbol])) {
				ids.set(listing.marketId, listing.symbol);
			}
		}

		return ids;
	});
}

export const ZoDex: Dex = {
	Name: "01",
	PairRegistry: ZoPairRegistry,
	ApiUrl: "https://zo-mainnet.n1.xyz",
	ApiUrlEndpoints: ZoApiUrlEndpoints,

	// retrieve all coins ctx and keep the ones wanted
	// we need to get the ids of the pairs to then get their fundings first
	async GetCurrentFunding(request: NextRequest) {
		const { searchParams } = new URL(request.url);
		const pairs: AssetValues[] = (searchParams.get(HTTPParams.assets)?.split(',') as AssetValues[]) || [];

		// get Zo ids
		// without them no funding can be fetched: any failure here fails the whole route
		let idsAndTickers: Map<number, keyof typeof ZoPairRegistry>;
		try {
			idsAndTickers = await getIdsAndTickers(pairs);
		} catch (err) {
			return dexErrorCatcher(ZoDex.Name, err);
		}
		const settled = await Promise.allSettled(
			Array.from(idsAndTickers.entries()).map(
				([id, ticker]) => ZoFetchoor(
					ZoApiUrl + ZoApiUrlEndpoints.stats(id),
					{ method: 'GET' }
				).then(data => {
					if (!Number.isFinite(data?.perpStats?.funding_rate)) return null; // null if no funding rate in response

					return {
						name: ZoPairRegistry[ticker], // get the local ticker name from id
						funding: annualizeHourlyFunding(data.perpStats.funding_rate), // it's already annualized as a rate in api
					} satisfies AssetAndFdg;
				})
			)
		);

		let fundings: (AssetAndFdg | null)[];
		try {
			fundings = settledToFundings(ZoDex.Name, settled);
		} catch (err) {
			return dexErrorCatcher(ZoDex.Name, err);
		}

		const assetsAndFundings = fundings
			.filter((v): v is AssetAndFdg => v !== null); // filter out null values

		return NextResponse.json(assetsAndFundings);
	},

	GetHstyFunding() {
		return undefined;
	},
} 
