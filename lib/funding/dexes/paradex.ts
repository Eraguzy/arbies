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
  "AIXBT-USD-PERP": ArbiesAssets.AIXBT,
  "APT-USD-PERP": ArbiesAssets.APT,
  "ARB-USD-PERP": ArbiesAssets.ARB,
  "ASTER-USD-PERP": ArbiesAssets.ASTER,
  "AVAX-USD-PERP": ArbiesAssets.AVAX,
  "AVNT-USD-PERP": ArbiesAssets.AVNT,
  "AXS-USD-PERP": ArbiesAssets.AXS,
  "BCH-USD-PERP": ArbiesAssets.BCH,
  "BERA-USD-PERP": ArbiesAssets.BERA,
  "BNB-USD-PERP": ArbiesAssets.BNB,
  "BTC-USD-PERP": ArbiesAssets.BTC,
  "BZ-USD-PERP": ArbiesAssets.BRENTOIL,
  "CC-USD-PERP": ArbiesAssets.CC,
  "CL-USD-PERP": ArbiesAssets.CL,
  "DOGE-USD-PERP": ArbiesAssets.DOGE,
  "DOT-USD-PERP": ArbiesAssets.DOT,
  "DYDX-USD-PERP": ArbiesAssets.DYDX,
  "EIGEN-USD-PERP": ArbiesAssets.EIGEN,
  "ENA-USD-PERP": ArbiesAssets.ENA,
  "ETHFI-USD-PERP": ArbiesAssets.ETHFI,
  "ETH-USD-PERP": ArbiesAssets.ETH,
  "EUR-USD-PERP": ArbiesAssets.EURUSD,
  "FARTCOIN-USD-PERP": ArbiesAssets.FARTCOIN,
  "FIL-USD-PERP": ArbiesAssets.FIL,
  "FOGO-USD-PERP": ArbiesAssets.FOGO,
  "GOAT-USD-PERP": ArbiesAssets.GOAT,
  "GRASS-USD-PERP": ArbiesAssets.GRASS,
  "HYPER-USD-PERP": ArbiesAssets.HYPER,
  "HYPE-USD-PERP": ArbiesAssets.HYPE,
  "INJ-USD-PERP": ArbiesAssets.INJ,
  "IP-USD-PERP": ArbiesAssets.IP,
  "JTO-USD-PERP": ArbiesAssets.JTO,
  "JUP-USD-PERP": ArbiesAssets.JUP,
  "KAITO-USD-PERP": ArbiesAssets.KAITO,
  "kBONK-USD-PERP": ArbiesAssets.BONK,
  "kSHIB-USD-PERP": ArbiesAssets.SHIB,
  "kPEPE-USD-PERP": ArbiesAssets.PEPE,
  "LDO-USD-PERP": ArbiesAssets.LDO,
  "LINK-USD-PERP": ArbiesAssets.LINK,
  "LIT-USD-PERP": ArbiesAssets.LIT,
  "LTC-USD-PERP": ArbiesAssets.LTC,
  "MET-USD-PERP": ArbiesAssets.MET,
  "MON-USD-PERP": ArbiesAssets.MON,
  "MORPHO-USD-PERP": ArbiesAssets.MORPHO,
  "NEAR-USD-PERP": ArbiesAssets.NEAR,
  "NG-USD-PERP": ArbiesAssets.NATGAS,
  "ONDO-USD-PERP": ArbiesAssets.ONDO,
  "OP-USD-PERP": ArbiesAssets.OP,
  "ORDI-USD-PERP": ArbiesAssets.ORDI,
  "PAXG-USD-PERP": ArbiesAssets.PAXG,
  "PENDLE-USD-PERP": ArbiesAssets.PENDLE,
  "PENGU-USD-PERP": ArbiesAssets.PENGU,
  "PUMP-USD-PERP": ArbiesAssets.PUMP,
  "PYTH-USD-PERP": ArbiesAssets.PYTH,
  "RESOLV-USD-PERP": ArbiesAssets.RESOLV,
  "SEI-USD-PERP": ArbiesAssets.SEI,
  "SOL-USD-PERP": ArbiesAssets.SOL,
  "STRK-USD-PERP": ArbiesAssets.STRK,
  "SUI-USD-PERP": ArbiesAssets.SUI,
  "S-USD-PERP": ArbiesAssets.S,
  "SPX-USD-PERP": ArbiesAssets.SPX6900,
  "SYRUP-USD-PERP": ArbiesAssets.SYRUP,
  "TAO-USD-PERP": ArbiesAssets.TAO,
  "TIA-USD-PERP": ArbiesAssets.TIA,
  "TON-USD-PERP": ArbiesAssets.TON,
  "TRUMP-USD-PERP": ArbiesAssets.TRUMP,
  "TRX-USD-PERP": ArbiesAssets.TRX,
  "UNI-USD-PERP": ArbiesAssets.UNI,
  "VIRTUAL-USD-PERP": ArbiesAssets.VIRTUAL,
  "WAL-USD-PERP": ArbiesAssets.WAL,
  "WIF-USD-PERP": ArbiesAssets.WIF,
  "WLD-USD-PERP": ArbiesAssets.WLD,
  "WLFI-USD-PERP": ArbiesAssets.WLFI,
  "XAG-USD-PERP": ArbiesAssets.XAG,
  "XLM-USD-PERP": ArbiesAssets.XLM,
  "XMR-USD-PERP": ArbiesAssets.XMR,
  "XPL-USD-PERP": ArbiesAssets.XPL,
  "XPT-USD-PERP": ArbiesAssets.XPT,
  "XRP-USD-PERP": ArbiesAssets.XRP,
  "ZEC-USD-PERP": ArbiesAssets.ZEC,
  "ZORA-USD-PERP": ArbiesAssets.ZORA,
  "ZRO-USD-PERP": ArbiesAssets.ZRO,
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