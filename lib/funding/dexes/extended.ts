import { ArbiesAssets, AssetValues } from "@/lib/funding/assets"
import { HTTPParams } from "@/app/api/req-params"
import { AssetAndFdg, annualizeHourlyFunding } from "@/app/api/funding/utils"
import type { Dex } from "@/lib/funding/dexes/arbies"
import { NextRequest, NextResponse } from "next/server"

// match Extended pairs with the local registry ; they are mapped by ids on the api
export const ExtndPairRegistry: Record<string, AssetValues> = {
  "ENA-USD": ArbiesAssets.ENA,
  "AVNT-USD": ArbiesAssets.AVNT,
  "EUR-USD": ArbiesAssets.EURUSD,
  "SUI-USD": ArbiesAssets.SUI,
  "WIF-USD": ArbiesAssets.WIF,
  "CAKE-USD": ArbiesAssets.CAKE,
  "MEGA-USD": ArbiesAssets.MEGA,
  "AVAX-USD": ArbiesAssets.AVAX,
  "HYPE-USD": ArbiesAssets.HYPE,
  "WLFI-USD": ArbiesAssets.WLFI,
  "INTC_24_5-USD": ArbiesAssets.INTC,
  "MSTR_24_5-USD": ArbiesAssets.MSTR,
  "XRP-USD": ArbiesAssets.XRP,
  "1000SHIB-USD": ArbiesAssets["1000SHIB"],
  "LTC-USD": ArbiesAssets.LTC,
  "KAITO-USD": ArbiesAssets.KAITO,
  "MU_24_5-USD": ArbiesAssets.MU,
  "MELANIA-USD": ArbiesAssets.MELANIA,
  "XPT-USD": ArbiesAssets.XPT,
  "USDJPY-USD": ArbiesAssets.USDJPY,
  "AZTEC-USD": ArbiesAssets.AZTEC,
  "AMZN_24_5-USD": ArbiesAssets.AMZN,
  "AAVE-USD": ArbiesAssets.AAVE,
  "SNDK_24_5-USD": ArbiesAssets.SNDK,
  "POPCAT-USD": ArbiesAssets.POPCAT,
  "APT-USD": ArbiesAssets.APT,
  "PUMP-USD": ArbiesAssets.PUMP,
  "SOL-USD": ArbiesAssets.SOL,
  "OP-USD": ArbiesAssets.OP,
  "SPX6900-USD": ArbiesAssets.SPX6900,
  "PLTR_24_5-USD": ArbiesAssets.PLTR,
  "TIA-USD": ArbiesAssets.TIA,
  "VVV-USD": ArbiesAssets.VVV,
  "S-USD": ArbiesAssets.S,
  "UNI-USD": ArbiesAssets.UNI,
  "XLM-USD": ArbiesAssets.XLM,
  "HOOD_24_5-USD": ArbiesAssets.HOOD,
  "MKR-USD": ArbiesAssets.MKR,
  "EDEN-USD": ArbiesAssets.EDEN,
  "SNX-USD": ArbiesAssets.SNX,
  "TSLA_24_5-USD": ArbiesAssets.TSLA,
  "CRV-USD": ArbiesAssets.CRV,
  "ETH-USD": ArbiesAssets.ETH,
  "MNT-USD": ArbiesAssets.MNT,
  "PENGU-USD": ArbiesAssets.PENGU,
  "WLD-USD": ArbiesAssets.WLD,
  "MON-USD": ArbiesAssets.MON,
  "GOOG_24_5-USD": ArbiesAssets.GOOGL,
  "NEAR-USD": ArbiesAssets.NEAR,
  "ASTER-USD": ArbiesAssets.ASTER,
  "AERO-USD": ArbiesAssets.AERO,
  "DOT-USD": ArbiesAssets.DOT,
  "1000PEPE-USD": ArbiesAssets["1000PEPE"],
  "MOG-USD": ArbiesAssets.MOG,
  "LINEA-USD": ArbiesAssets.LINEA,
  "NVDA_24_5-USD": ArbiesAssets.NVDA,
  "GRASS-USD": ArbiesAssets.GRASS,
  "XAU-USD": ArbiesAssets.XAU,
  "TON-USD": ArbiesAssets.TON,
  "BERA-USD": ArbiesAssets.BERA,
  "TRUMP-USD": ArbiesAssets.TRUMP,
  "BP-USD": ArbiesAssets.BP,
  "BCH-USD": ArbiesAssets.BCH,
  "TAO-USD": ArbiesAssets.TAO,
  "XPL-USD": ArbiesAssets.XPL,
  "EIGEN-USD": ArbiesAssets.EIGEN,
  "PENDLE-USD": ArbiesAssets.PENDLE,
  "MOODENG-USD": ArbiesAssets.MOODENG,
  "INIT-USD": ArbiesAssets.INIT,
  "COIN_24_5-USD": ArbiesAssets.COIN,
  "WTI-USD": ArbiesAssets.CL,
  "GOAT-USD": ArbiesAssets.GOAT,
  "XNG-USD": ArbiesAssets.NATGAS,
  "MSFT_24_5-USD": ArbiesAssets.MSFT,
  "XAG-USD": ArbiesAssets.XAG,
  "XBR-USD": ArbiesAssets.BRENTOIL,
  "LDO-USD": ArbiesAssets.LDO,
  "BNB-USD": ArbiesAssets.BNB,
  "DOGE-USD": ArbiesAssets.DOGE,
  "1000BONK-USD": ArbiesAssets["1000BONK"],
  "SPX500m-USD": ArbiesAssets.SP500,
  "SEI-USD": ArbiesAssets.SEI,
  "VIRTUAL-USD": ArbiesAssets.VIRTUAL,
  "LIT-USD": ArbiesAssets.LIT,
  "BTC-USD": ArbiesAssets.BTC,
  "AAPL_24_5-USD": ArbiesAssets.AAPL,
  "XMR-USD": ArbiesAssets.XMR,
  "EDGE-USD": ArbiesAssets.EDGE,
  "RESOLV-USD": ArbiesAssets.RESOLV,
  "SIREN-USD": ArbiesAssets.SIREN,
  "ADA-USD": ArbiesAssets.ADA,
  "4-USD": ArbiesAssets["4"],
  "STRK-USD": ArbiesAssets.STRK,
  "LINK-USD": ArbiesAssets.LINK,
  "CRCL_24_5-USD": ArbiesAssets.CRCL,
  "IP-USD": ArbiesAssets.IP,
  "ARB-USD": ArbiesAssets.ARB,
  "TRX-USD": ArbiesAssets.TRX,
  "ONDO-USD": ArbiesAssets.ONDO,
  "XCU-USD": ArbiesAssets.XCU,
  "ZEC-USD": ArbiesAssets.ZEC,
  "JUP-USD": ArbiesAssets.JUP,
  "FARTCOIN-USD": ArbiesAssets.FARTCOIN,
  "ZORA-USD": ArbiesAssets.ZORA,
  "APEX-USD": ArbiesAssets.APEX,
  "1000000MOG-USD": ArbiesAssets["1000000MOG"],
  "ZRO-USD": ArbiesAssets.ZRO,
  "AMD_24_5-USD": ArbiesAssets.AMD,
}

export function getExtendedPair(asset: AssetValues): string | undefined {
  return Object.entries(ExtndPairRegistry).find((entry) => entry[1] === asset)?.[0]
}

const ExtndApiUrl = "https://api.starknet.extended.exchange/api/v1/info";

const ExtndApiUrlEndpoints = {
  markets: "/markets",
  fundings: "/fundings",
  fundingRates: "/funding-rates",
};

type ExtndMarket = {
  name: string;
  marketStats: {
    fundingRate: number;
  };
};

export const ExtndDex = {
  Name: "Extended",
  PairRegistry: ExtndPairRegistry,
  ApiUrl: ExtndApiUrl,
  ApiUrlEndpoints: ExtndApiUrlEndpoints,

  async GetCurrentFunding(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const pairs = searchParams.get(HTTPParams.assets)?.split(",") || [];

    const extndPairs: string[] = [];
    for (const pair of pairs) {
      const extendedPair = getExtendedPair(pair as AssetValues);
      if (extendedPair) {
        extndPairs.push(extendedPair);
      }
    }

    if (extndPairs.length === 0) {
      return NextResponse.json({ error: "no valid pairs provided" }, { status: 400 });
    }

    const res = await fetch(
      ExtndApiUrl + ExtndApiUrlEndpoints.markets
      + "?market=" + extndPairs.join("&market="),
      {
        method: "GET",
        headers: { accept: "application/json" },
      }
    );
    const data = await res.json();
    if (data.status !== "ok" && data.status !== "OK") {
      return NextResponse.json({ error: "status is invalid" }, { status: 500 });
    }
    if (!data || !data.data || data.data.length === 0) {
      return NextResponse.json({ error: "No data found" }, { status: 404 });
    }

    const assetsAndFundings: AssetAndFdg[] = data.data.map((universe: ExtndMarket) => {
      return {
        name: ExtndPairRegistry[universe.name],
        funding: annualizeHourlyFunding(universe.marketStats.fundingRate),
      };
    });

    return NextResponse.json(assetsAndFundings);
  },

  GetHstyFunding() {
    return undefined;
  },
} satisfies Dex