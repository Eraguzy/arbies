import { ArbiesAssets, AssetValues } from "@/lib/funding/assets"
import { HTTPParams } from "@/app/api/req-params"
import { AssetAndFdg, annualizeHourlyFunding } from "@/app/api/funding/utils"
import type { Dex } from "@/lib/funding/dexes/arbies"
import { NextRequest, NextResponse } from "next/server"

// match Meridian pairs with the local registry
export const MeridianPairRegistry: Record<string, AssetValues> = {
  "BTCUSD": ArbiesAssets.BTC,
  "ETHUSD": ArbiesAssets.ETH,
  "SOLUSD": ArbiesAssets.SOL,
  "HYPEUSD": ArbiesAssets.HYPE,
  "ENAUSD": ArbiesAssets.ENA,
  "ZECUSD": ArbiesAssets.ZEC,
  "LITUSD": ArbiesAssets.LIT,
  "NEARUSD": ArbiesAssets.NEAR,
  "VVVUSD": ArbiesAssets.VVV,
  "XAUXAUUSD": ArbiesAssets.XAU,
  "XAGXAGUSD": ArbiesAssets.XAG,
  "SPYSPYUSD": ArbiesAssets.SPY500,
  "QQQQQQUSD": ArbiesAssets.QQQ,
}

const MeridianApiUrl = "https://api.meridian.xyz/v1";

const MeridianApiUrlEndpoints = {
  product: "/product",
  projectedFunding: "/funding/projected-rate",
};

type MeridianData = {
  productId: string;
  fundingRateProjected1h: number;
};

async function getIdsAndTickers(assets: AssetValues[]): Promise<Map<string, keyof typeof MeridianPairRegistry>> {
  const res = await fetch(
    MeridianApiUrl + MeridianApiUrlEndpoints.product,
    {
      method: "GET",
      headers: { accept: "application/json" },
    }
  );
  const data = await res.json();
  if (!data || !data.data || data.data.length === 0) {
    return new Map();
  }

  const ids: Map<string, keyof typeof MeridianPairRegistry> = new Map();
  for (const listing of data.data) {
    if (assets.includes(MeridianPairRegistry[listing.ticker])) {
      ids.set(listing.id, listing.ticker);
    }
  }
  return ids;
}

export const MeridianDex = {
  Name: "Meridian",
  PairRegistry: MeridianPairRegistry,
  ApiUrl: MeridianApiUrl,
  ApiUrlEndpoints: MeridianApiUrlEndpoints,

  async GetCurrentFunding(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const pairs: AssetValues[] = (searchParams.get(HTTPParams.assets)?.split(",") as AssetValues[]) || [];

    const idsAndTickers = await getIdsAndTickers(pairs);

    const res = await fetch(
      MeridianApiUrl + MeridianApiUrlEndpoints.projectedFunding
      + "?productIds=" + Array.from(idsAndTickers.keys()).join("&productIds="),
      {
        method: "GET",
        headers: { accept: "application/json" },
      }
    );
    const data = await res.json();
    if (!data || !data.data || data.data.length === 0) {
      return NextResponse.json({ error: "No data found" }, { status: 404 });
    }

    const assetsAndFundings: AssetAndFdg[] = data.data
      .filter((listing: MeridianData) => pairs.includes(MeridianPairRegistry[idsAndTickers.get(listing.productId)!]))
      .map((universe: MeridianData) => {
        if (!idsAndTickers.has(universe.productId)) {
          return null;
        }
        return {
          name: MeridianPairRegistry[idsAndTickers.get(universe.productId)!],
          funding: annualizeHourlyFunding(universe.fundingRateProjected1h),
        };
      })
      .filter((value: AssetAndFdg | null): value is AssetAndFdg => value !== null);

    return NextResponse.json(assetsAndFundings);
  },

  GetHstyFunding() {
    return undefined;
  },
} satisfies Dex
