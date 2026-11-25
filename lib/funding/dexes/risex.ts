import { ArbiesAssets, AssetValues } from "@/lib/funding/assets"
import { HTTPParams } from "@/app/api/req-params"
import { AssetAndFdg, annualizeHourlyFunding } from "@/app/api/funding/utils"
import type { Dex } from "@/lib/funding/dexes/arbies"
import { NextRequest, NextResponse } from "next/server"
import { DexApiError, fetchDexJSON, dexErrorCatcher } from "@/lib/funding/misc"

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
	"QQQ/USDC": ArbiesAssets.QQQ,
	"SPY/USDC": ArbiesAssets.SPY500,
	"INTC/USDC": ArbiesAssets.INTC,
	"MSTR/USDC": ArbiesAssets.MSTR,
	"KORU/USDC": ArbiesAssets.KORU,
	"CRCL/USDC": ArbiesAssets.CRCL,
	"TSLA/USDC": ArbiesAssets.TSLA,
	"ARB/USDC": ArbiesAssets.ARB,
	"HOOD/USDC": ArbiesAssets.HOOD,
	"SKHYNIX/USDC": ArbiesAssets.SKHYNIX,
	"NVDA/USDC": ArbiesAssets.NVDA,
	"META/USDC": ArbiesAssets.META,
	"ENA/USDC": ArbiesAssets.ENA,
	"SOXL/USDC": ArbiesAssets.SOXL,
	"MON/USDC": ArbiesAssets.MON,
	"WLD/USDC": ArbiesAssets.WLD,
	"GOOGL/USDC": ArbiesAssets.GOOGL,
	"STRK/USDC": ArbiesAssets.STRK,
	"ZRO/USDC": ArbiesAssets.ZRO,
	"CRWV/USDC": ArbiesAssets.CRWV,
	"XMR/USDC": ArbiesAssets.XMR,
	"EWZ/USDC": ArbiesAssets.EWZ,
	"LLY/USDC": ArbiesAssets.LLY,
	"CHIP/USDC": ArbiesAssets.CHIP,
	"QCOM/USDC": ArbiesAssets.QCOM,
	"ARM/USDC": ArbiesAssets.ARM,
	"TTWO/USDC": ArbiesAssets.TTWO,
	"HIMS/USDC": ArbiesAssets.HIMS,
	"1000PEPE/USDC": ArbiesAssets.PEPE,
	"AMD/USDC": ArbiesAssets.AMD,
	"AMZN/USDC": ArbiesAssets.AMZN,
	"ETHFI/USDC": ArbiesAssets.ETHFI,
	"ANT/USDC": ArbiesAssets.ANTHROPIC,
	"AAPL/USDC": ArbiesAssets.AAPL,
	"NBIS/USDC": ArbiesAssets.NBIS,
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
/** @throws DexApiError */
function getExpectedFundingRates(timeoutMs: number): Promise<RisexExpectedFundingRate[]> {
	return new Promise((resolve, reject) => {
		const ws = new WebSocket(RisexWsUrl);

		const timeout = setTimeout(() => {
			ws.close();
			reject(new DexApiError(RisexDex.Name, RisexWsUrl, "timeout"));
		}, timeoutMs);
		const fail = (err: DexApiError) => {
			clearTimeout(timeout);
			ws.close();
			reject(err);
		};

		ws.onopen = () => {
			ws.send(JSON.stringify({
				method: "subscribe",
				params: { channel: "expected_funding_rate" },
			}));
		};
		ws.onmessage = (event) => {
			let msg;
			try {
				msg = JSON.parse(event.data);
			} catch (err) {
				fail(new DexApiError(RisexDex.Name, RisexWsUrl, "invalid-json", { cause: err }));
				return;
			}

			if (msg.channel === "expected_funding_rate" && msg.type === "update") {
				if (!Array.isArray(msg.data)) {
					fail(new DexApiError(RisexDex.Name, RisexWsUrl, "invalid-data"));
					return;
				}

				clearTimeout(timeout);
				ws.close();
				resolve(msg.data);
			}
		};
		ws.onerror = (event) => {
			fail(new DexApiError(RisexDex.Name, RisexWsUrl, "network", { cause: event }));
		};
		ws.onclose = () => { // closed by the server before the first update
			fail(new DexApiError(RisexDex.Name, RisexWsUrl, "network"));
		};
	});
}

export const RisexDex: Dex = {
	Name: "RISEx",
	PairRegistry: RisexPairRegistry,
	ApiUrl: RisexApiUrl,
	ApiUrlEndpoints: RisexApiUrlEndpoints,

	async GetCurrentFunding(request: NextRequest) {
		const { searchParams } = new URL(request.url);
		const pairs = searchParams.get(HTTPParams.assets)?.split(",") || [];

		const RisexApiTimeoutMs = 5000;
		const RisexWsTimeoutMs = 10000; // wait for the first ws message

		const url = RisexApiUrl + RisexApiUrlEndpoints.markets;
		let mktData;
		let expectedRates: RisexExpectedFundingRate[];
		try {
			// both calls are mandatory: any failure fails the whole route
			[mktData, expectedRates] = await Promise.all([
				fetchDexJSON(
					RisexDex.Name,
					url,
					{
						method: "GET",
						headers: { accept: "application/json" },
					},
					RisexApiTimeoutMs,
				),
				getExpectedFundingRates(RisexWsTimeoutMs),
			]);
			if (!mktData || !mktData.data || !Array.isArray(mktData.data.markets)) {
				throw new DexApiError(RisexDex.Name, url, "invalid-data");
			}
		} catch (err) {
			return dexErrorCatcher(RisexDex.Name, err);
		}

		const fundingById: Record<string, string> = {};
		expectedRates.forEach((rate) => {
			fundingById[rate.market_id] = rate.estimated_rate;
		});

		// match funding with mkt data
		const assetsAndFundings: AssetAndFdg[] =
			mktData.data.markets.filter((universe: RisexData) =>
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
}
