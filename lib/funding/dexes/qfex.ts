import { ArbiesAssets, AssetValues } from "@/lib/funding/assets"
import { annualizeExactHourlyFunding, AssetAndFdg } from "@/app/api/funding/utils"
import type { Dex } from "@/lib/funding/dexes/arbies"
import { NextRequest, NextResponse } from "next/server"

// match QFEX pairs with the local registry
export const QFEXPairRegistry: Record<string, AssetValues> = {
  "AAPL-USD": ArbiesAssets.AAPL,
  "BA-USD": ArbiesAssets.BA,
  "CL-USD": ArbiesAssets.CL,
  "COPPER-USD": ArbiesAssets.XCU,
  "CRCL-USD": ArbiesAssets.CRCL,
  "CRWV-USD": ArbiesAssets.CRWV,
  "EUR-USD": ArbiesAssets.EURUSD,
  "GD-USD": ArbiesAssets.GD,
  "GBP-USD": ArbiesAssets.GBPUSD,
  "GOLD-USD": ArbiesAssets.XAU,
  "GOOGL-USD": ArbiesAssets.GOOGL,
  "HOOD-USD": ArbiesAssets.HOOD,
  "INTC-USD": ArbiesAssets.INTC,
  // "KOSPI-USD": ArbiesAssets.KRCOMP,
  "LMT-USD": ArbiesAssets.LMT,
  "META-USD": ArbiesAssets.META,
  "MSFT-USD": ArbiesAssets.MSFT,
  "NATGAS-USD": ArbiesAssets.NATGAS,
  "NOC-USD": ArbiesAssets.NOC,
  "NVDA-USD": ArbiesAssets.NVDA,
  "PLTR-USD": ArbiesAssets.PLTR,
  "RKLB-USD": ArbiesAssets.RKLB,
  "RTX-USD": ArbiesAssets.RTX,
  "SILVER-USD": ArbiesAssets.XAG,
  "SNDK-USD": ArbiesAssets.SNDK,
  "TSLA-USD": ArbiesAssets.TSLA,
  "URANIUM-USD": ArbiesAssets.URA,
  "US100-USD": ArbiesAssets.NASDAQ,
  "US500-USD": ArbiesAssets.SP500,
  "MU-USD": ArbiesAssets.MU,
}

const QfexApiUrl = "https://api.qfex.com";

const QfexApiUrlEndpoints = {
  mdContracts: "/md/contracts",
  fundingHsty: "/funding",
};

export const QFEXDex = {
  Name: "QFEX",
  PairRegistry: QFEXPairRegistry,
  ApiUrl: QfexApiUrl,
  ApiUrlEndpoints: QfexApiUrlEndpoints,

  async GetCurrentFunding(request: NextRequest) {
    void request;

    const res = await fetch(
      QfexApiUrl + QfexApiUrlEndpoints.mdContracts,
      { method: "GET", headers: { accept: "application/json" } },
    );

    const data = await res.json();
    if (!data || !data.data) {
      return NextResponse.json({ error: "No data found" }, { status: 404 });
    }

    const fundingData: AssetAndFdg[] = [];
    for (const pairData of data.data) {
      if (QFEXPairRegistry[pairData.ticker_id]) {
        fundingData.push({
          name: QFEXPairRegistry[pairData.ticker_id],
          funding: annualizeExactHourlyFunding(pairData.next_funding_rate),
        });
      }
    }
    return NextResponse.json(fundingData);
  },

  GetHstyFunding() {
    return undefined;
  },
} satisfies Dex
