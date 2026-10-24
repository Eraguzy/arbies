import { ArbiesAssets, AssetValues } from "@/lib/funding/assets"
import { HTTPParams } from "@/app/api/req-params"
import { AssetAndFdg, annualize8HourlyFunding } from "@/app/api/funding/utils"
import type { Dex } from "@/lib/funding/dexes/arbies"
import { NextRequest, NextResponse } from "next/server"
import { wait } from "@/lib/funding/misc"

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
  "SNDK-USD-PERP": ArbiesAssets.SNDK,
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
}

// find key from value, return first elem
export function getParadexPair(asset: AssetValues): string | undefined {
  return Object.entries(ParadexPairRegistry).find((entry) => entry[1] === asset)?.[0]
}

const ParadexApiUrl = "https://api.prod.paradex.trade/v1";

const ParadexApiUrlEndpoints = {
  funding: "/funding/data",
};

const ParadexApiRatePerSec = 120

export const ParadexDex = {
  Name: "Paradex",
  PairRegistry: ParadexPairRegistry,
  ApiUrl: ParadexApiUrl,
  ApiUrlEndpoints: ParadexApiUrlEndpoints,

  async GetCurrentFunding(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const pairs: AssetValues[] = searchParams
      .get(HTTPParams.assets)
      ?.split(",")
      .map((p: string) => getParadexPair(p as AssetValues))
      .filter((v): v is AssetValues => !!v) || [];

    // paradex rate limit : 120 req/s
    const settled: PromiseSettledResult<AssetAndFdg | null>[] = [];
    for (let i = 0; i < pairs.length; i += ParadexApiRatePerSec) {

      const start = performance.now();
      settled.push(...await Promise.allSettled(
        pairs.slice(i, i + ParadexApiRatePerSec).map(async (pair) => {
          return fetch(
            ParadexApiUrl + ParadexApiUrlEndpoints.funding + "?market=" + pair,
            { method: "GET", headers: { accept: "application/json" } }
          ).then((res) => res.json())
            .then((data) => {
              if (!data?.results?.length) return null;

              return {
                name: ParadexPairRegistry[pair],
                funding: annualize8HourlyFunding(data.results[0].funding_rate),
              } satisfies AssetAndFdg;
            });
        })
      ));

      if (i + ParadexApiRatePerSec < pairs.length)
        await wait(Math.max(0, 1000 - (performance.now() - start)));
    }

    const assetsAndFundings = settled
      .filter((r): r is PromiseFulfilledResult<AssetAndFdg | null> => r.status === "fulfilled")
      .map(r => r.value)
      .filter((v): v is AssetAndFdg => v !== null);

    return NextResponse.json(assetsAndFundings);
  },

  GetHstyFunding() {
    return undefined;
  },
} satisfies Dex