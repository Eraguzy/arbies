import { NextRequest, NextResponse } from 'next/server';

import { ArbiesAssets, AssetValues } from "@/lib/funding/assets"
import type { Dex } from "@/lib/funding/dexes/arbies"
import { HTTPParams } from '@/app/api/req-params';
import { AssetAndFdg } from "@/app/api/funding/utils"
import { annualizeHourlyFunding } from '@/app/api/funding/utils';
import { wait } from '@/lib/funding/misc';

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
}

const ZoApiUrl = "https://zo-mainnet.n1.xyz";

const ZoApiUrlEndpoints = {
	info: "/info", // contains ticker, id
	stats: (id: number) => `/market/${id}/stats`, // contains funding rate
}

const ZoApiRatePerSec = 100; // hypothetic, undocumented

// get Zo ids based on the local pairs
// return format: [{ id: '0', ticker: 'BTCUSD' }, ...]
async function getIdsAndTickers(assets: AssetValues[]): Promise<Map<number, keyof typeof ZoPairRegistry>> {
	const res = await fetch(
		ZoApiUrl + ZoApiUrlEndpoints.info,
		{
			method: 'GET',
			// headers: { accept: 'application/json' },
		}
	);
	const data = await res.json();
	if (!data || !data.markets || data.markets.length === 0) {
		return new Map();
	}

	const ids: Map<number, keyof typeof ZoPairRegistry> = new Map();
	for (const listing of data.markets) {
		if (assets.includes(ZoPairRegistry[listing.symbol])) {
			ids.set(listing.marketId, listing.symbol);
		}
	}
	return ids;
}

export const ZoDex = {
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
		const idsAndTickers = await getIdsAndTickers(pairs);
		const settled = await Promise.allSettled(
			Array.from(idsAndTickers.entries()).map(
				async ([id, ticker]) => {
					const res = await fetch(ZoApiUrl + ZoApiUrlEndpoints.stats(id), { method: 'GET' });
					const data = await res.json();
					if (!data?.perpStats?.funding_rate) return null;

					return {
						name: ZoPairRegistry[ticker], // get the local ticker name from id
						funding: annualizeHourlyFunding(data.perpStats.funding_rate), // it's already annualized as a rate in api
					} satisfies AssetAndFdg;
				}
			)
		);

		const assetsAndFundings = settled
			.filter((r): r is PromiseFulfilledResult<AssetAndFdg | null> => r.status === 'fulfilled') // keep only fulfilled promises
			.map(r => r.value) // keep values from promises
			.filter((v): v is AssetAndFdg => v !== null); // filter out null values

		return NextResponse.json(assetsAndFundings);
	},

	GetHstyFunding() {
		return undefined;
	},
} satisfies Dex