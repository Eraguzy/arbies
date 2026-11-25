import { ArbiesAssets, AssetValues } from "@/lib/funding/assets"
import { HTTPParams } from "@/app/api/req-params"
import { AssetAndFdg, annualizeHourlyFunding } from "@/app/api/funding/utils"
import type { Dex } from "@/lib/funding/dexes/arbies"
import { NextRequest, NextResponse } from "next/server"
import { DexApiError, fetchDexJSON, dexErrorCatcher } from "@/lib/funding/misc"

// match paradex pairs with the local registry ; they are mapped by ids on the api
export const ParadexPairRegistry: Record<string, AssetValues> = {
  "AAVE-USD-PERP": ArbiesAssets.AAVE,
  "ADA-USD-PERP": ArbiesAssets.ADA,
  "AERO-USD-PERP": ArbiesAssets.AERO,
  "AVAX-USD-PERP": ArbiesAssets.AVAX,
  "BNB-USD-PERP": ArbiesAssets.BNB,
  "BTC-USD-PERP": ArbiesAssets.BTC,
  "BZ-USD-PERP": ArbiesAssets.BRENTOIL,
  "CC-USD-PERP": ArbiesAssets.CC,
  "CL-USD-PERP": ArbiesAssets.CL,
  "CRCL-USD-PERP": ArbiesAssets.CRCL,
  "DOGE-USD-PERP": ArbiesAssets.DOGE,
  "DRAM-USD-PERP": ArbiesAssets.DRAM,
  "ENA-USD-PERP": ArbiesAssets.ENA,
  "ETHFI-USD-PERP": ArbiesAssets.ETHFI,
  "ETH-USD-PERP": ArbiesAssets.ETH,
  "EWY-USD-PERP": ArbiesAssets.KOSPI,
  "GOOGL-USD-PERP": ArbiesAssets.GOOGL,
  "GRAM-USD-PERP": ArbiesAssets.GRAM,
  "HYPE-USD-PERP": ArbiesAssets.HYPE,
  "INTC-USD-PERP": ArbiesAssets.INTC,
  "JTO-USD-PERP": ArbiesAssets.JTO,
  "JUP-USD-PERP": ArbiesAssets.JUP,
  "KAITO-USD-PERP": ArbiesAssets.KAITO,
  "kSHIB-USD-PERP": ArbiesAssets.SHIB,
  "kPEPE-USD-PERP": ArbiesAssets.PEPE,
  "LDO-USD-PERP": ArbiesAssets.LDO,
  "LINK-USD-PERP": ArbiesAssets.LINK,
  "LIT-USD-PERP": ArbiesAssets.LIT,
  "LTC-USD-PERP": ArbiesAssets.LTC,
  "META-USD-PERP": ArbiesAssets.META,
  "MON-USD-PERP": ArbiesAssets.MON,
  "MORPHO-USD-PERP": ArbiesAssets.MORPHO,
  "MRVL-USD-PERP": ArbiesAssets.MRVL,
  "MSFT-USD-PERP": ArbiesAssets.MSFT,
  "MSTR-USD-PERP": ArbiesAssets.MSTR,
  "MU-USD-PERP": ArbiesAssets.MU,
  "NEAR-USD-PERP": ArbiesAssets.NEAR,
  "NG-USD-PERP": ArbiesAssets.NATGAS,
  "NVDA-USD-PERP": ArbiesAssets.NVDA,
  "ONDO-USD-PERP": ArbiesAssets.ONDO,
  "PAXG-USD-PERP": ArbiesAssets.PAXG,
  "PENDLE-USD-PERP": ArbiesAssets.PENDLE,
  "PUMP-USD-PERP": ArbiesAssets.PUMP,
  "PYTH-USD-PERP": ArbiesAssets.PYTH,
  "SOL-USD-PERP": ArbiesAssets.SOL,
  "SPCX-USD-PERP": ArbiesAssets.SPCX,
  "STRK-USD-PERP": ArbiesAssets.STRK,
  "SUI-USD-PERP": ArbiesAssets.SUI,
  "TAO-USD-PERP": ArbiesAssets.TAO,
  "TRUMP-USD-PERP": ArbiesAssets.TRUMP,
  "TRX-USD-PERP": ArbiesAssets.TRX,
  "TSLA-USD-PERP": ArbiesAssets.TSLA,
  "UNI-USD-PERP": ArbiesAssets.UNI,
  "US100-USD-PERP": ArbiesAssets.QQQ,
  "US500-USD-PERP": ArbiesAssets.SPY500,
  "VVV-USD-PERP": ArbiesAssets.VVV,
  "WLFI-USD-PERP": ArbiesAssets.WLFI,
  "XAG-USD-PERP": ArbiesAssets.XAG,
  "XAU-USD-PERP": ArbiesAssets.XAU,
  "XCU-USD-PERP": ArbiesAssets.XCU,
  "XMR-USD-PERP": ArbiesAssets.XMR,
  "XPL-USD-PERP": ArbiesAssets.XPL,
  "XPT-USD-PERP": ArbiesAssets.XPT,
  "XRP-USD-PERP": ArbiesAssets.XRP,
  "ZEC-USD-PERP": ArbiesAssets.ZEC,
  "ANT-USD-PERP": ArbiesAssets.ANTHROPIC,
}

// find key from value, return first elem
export function getParadexPair(asset: AssetValues): string | undefined {
  return Object.entries(ParadexPairRegistry).find((entry) => entry[1] === asset)?.[0]
}

const ParadexApiUrl = "https://api.prod.paradex.trade/v1";

const ParadexApiUrlEndpoints = {
  funding: "/funding/data",
  marketsSummary: "/markets/summary",
};

type ParadexSummary = {
  symbol: string;
  funding_rate: string; // raw rate over the market funding interval
  funding_interval_minutes: number;
};

export const ParadexDex: Dex = {
  Name: "Paradex",
  PairRegistry: ParadexPairRegistry,
  ApiUrl: ParadexApiUrl,
  ApiUrlEndpoints: ParadexApiUrlEndpoints,

  async GetCurrentFunding(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const pairs = searchParams.get(HTTPParams.assets)?.split(",") || [];

    const ParadexApiTimeoutMs = 5000;

    // fetch all perp markets in one call and filter locally
    const url = ParadexApiUrl + ParadexApiUrlEndpoints.marketsSummary + "?market=ALL&asset_kind=PERP"; // dont fetch options
    let result;
    try {
      result = await fetchDexJSON(
        ParadexDex.Name,
        url,
        { method: "GET", headers: { accept: "application/json" } },
        ParadexApiTimeoutMs,
      );
      if (!result || !Array.isArray(result.results)) {
        throw new DexApiError(ParadexDex.Name, url, "invalid-data");
      }
    } catch (err) {
      return dexErrorCatcher(ParadexDex.Name, err);
    }

    const assetsAndFundings: AssetAndFdg[] = result.results
      .filter((market: ParadexSummary) => pairs.includes(ParadexPairRegistry[market.symbol]))
      .map((market: ParadexSummary) => {
        return {
          name: ParadexPairRegistry[market.symbol],
          funding: annualizeHourlyFunding(Number(market.funding_rate) * 60 / market.funding_interval_minutes), // rate per interval to hourly rate
        };
      });

    return NextResponse.json(assetsAndFundings);
  },

  GetHstyFunding() {
    return undefined;
  },
}