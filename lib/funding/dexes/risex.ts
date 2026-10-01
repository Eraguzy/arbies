import { ArbiesAssets, AssetValues } from "@/lib/funding/assets"
import { HTTPParams } from "@/app/api/req-params"
import { AssetAndFdg, annualizeHourlyFunding } from "@/app/api/funding/utils"
import type { Dex } from "@/lib/funding/dexes/arbies"
import { NextRequest, NextResponse } from "next/server"

// match RISEx pairs with the local registry
export const RisexPairRegistry: Record<string, AssetValues> = {
	"BTC/USDC": ArbiesAssets.BTC,
	"ETH/USDC": ArbiesAssets.ETH,
	"BNB/USDC": ArbiesAssets.BNB,
	"SOL/USDC": ArbiesAssets.SOL,
	"HYPE/USDC": ArbiesAssets.HYPE,
	"XRP/USDC": ArbiesAssets.XRP,
	"TAO/USDC": ArbiesAssets.TAO,
	"ZEC/USDC": ArbiesAssets.ZEC,
	"ONDO/USDC": ArbiesAssets.ONDO,
	"NEAR/USDC": ArbiesAssets.NEAR,
	"VVV/USDC": ArbiesAssets.VVV,
	"LIT/USDC": ArbiesAssets.LIT,
	"DOGE/USDC": ArbiesAssets.DOGE,
	"AERO/USDC": ArbiesAssets.AERO,
	"AAVE/USDC": ArbiesAssets.AAVE,
	"XAU/USDC": ArbiesAssets.XAU,
	"XAG/USDC": ArbiesAssets.XAG,
	"CL/USDC": ArbiesAssets.CL,
	"BZ/USDC": ArbiesAssets.BRENTOIL,
	"SNDK/USDC": ArbiesAssets.SNDK,
	"SPCX/USDC": ArbiesAssets.SPCX,
	"PUMP/USDC": ArbiesAssets.PUMP,
	"DRAM/USDC": ArbiesAssets.DRAM,
	"MU/USDC": ArbiesAssets.MU,
	"QQQ/USDC": ArbiesAssets.NASDAQ,
	"SPY/USDC": ArbiesAssets.SP500,
	"INTC/USDC": ArbiesAssets.INTC,
	"MSTR/USDC": ArbiesAssets.MSTR,
	"KORU/USDC": ArbiesAssets.KORU,
	"CRCL/USDC": ArbiesAssets.CRCL,
	"TSLA/USDC": ArbiesAssets.TSLA,
	"ARB/USDC": ArbiesAssets.ARB,
	"HOOD/USDC": ArbiesAssets.HOOD,
	"SKHYNIX/USDC": ArbiesAssets.SKHYNIX,
	"NVDA/USDC": ArbiesAssets.NVDA,
}

const RisexApiUrl = "https://api.rise.trade/v1";

const RisexApiUrlEndpoints = {
	markets: "/markets",
};

const RisexWsUrl = "wss://ws.rise.trade/ws";

type RisexData = {
	market_id: string;
	active: boolean;
	config: { name: string };
};

type RisexExpectedFundingRate = {
	market_id: string;
	estimated_rate: string;
};

// one-shot ws : subscribe to the expected funding rates, wait for the first update (~5s), then close
function getExpectedFundingRates(): Promise<RisexExpectedFundingRate[]> {
	return new Promise((resolve, reject) => {
		const ws = new WebSocket(RisexWsUrl);
		const timeout = setTimeout(() => {
			ws.close();
			reject(new Error("RISEx ws timeout"));
		}, 10000);

		ws.onopen = () => {
			ws.send(JSON.stringify({
				method: "subscribe",
				params: { channel: "expected_funding_rate" },
			}));
		};
		ws.onmessage = (event) => {
			const msg = JSON.parse(event.data);
			if (msg.channel === "expected_funding_rate" && msg.type === "update") {
				clearTimeout(timeout);
				ws.close();
				resolve(msg.data);
			}
		};
		ws.onerror = () => {
			clearTimeout(timeout);
			ws.close();
			reject(new Error("RISEx ws error"));
		};
	});
}

export const RisexDex = {
	Name: "RISEx",
	PairRegistry: RisexPairRegistry,
	ApiUrl: RisexApiUrl,
	ApiUrlEndpoints: RisexApiUrlEndpoints,

	async GetCurrentFunding(request: NextRequest) {
		const { searchParams } = new URL(request.url);
		const pairs = searchParams.get(HTTPParams.assets)?.split(",") || [];

		const [res, expectedRates] = await Promise.all([
			fetch(
				RisexApiUrl + RisexApiUrlEndpoints.markets,
				{
					method: "GET",
					headers: { accept: "application/json" },
				}
			),
			getExpectedFundingRates(), // ws => pairs market id and funding
		]);

		const data = await res.json();
		if (!data || !expectedRates) {
			return NextResponse.json({ error: "No data found" }, { status: 404 });
		}

		const fundingById: Record<string, string> = {};
		expectedRates.forEach((rate) => {
			fundingById[rate.market_id] = rate.estimated_rate;
		});

		// find the funding corresponding to the market id in the record
		const assetsAndFundings: AssetAndFdg[] = data.data.markets
			.filter((universe: RisexData) =>
				universe.active &&
				fundingById[universe.market_id] !== undefined &&
				pairs.includes(RisexPairRegistry[universe.config.name])
			)
			.map((universe: RisexData) => {
				return {
					name: RisexPairRegistry[universe.config.name],
					funding: annualizeHourlyFunding(Number(fundingById[universe.market_id])),
				};
			});

		return NextResponse.json(assetsAndFundings);
	},

	GetHstyFunding() {
		return undefined;
	},
} satisfies Dex
