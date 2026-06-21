import { ArbiesAssets, AssetValues } from "@/lib/funding/assets"
import { HTTPParams } from "@/app/api/req-params"
import { AssetAndFdg, annualizeHourlyFunding } from "@/app/api/funding/utils"
import type { Dex } from "@/lib/funding/dexes/arbies"
import { NextRequest, NextResponse } from "next/server"

// match Ethereal pairs with the local registry
export const EtherealPairRegistry: Record<string, AssetValues> = {
  "BTCUSD": ArbiesAssets.BTC,
  "ETHUSD": ArbiesAssets.ETH,
  "SOLUSD": ArbiesAssets.SOL,
  "HYPEUSD": ArbiesAssets.HYPE,
  "SUIUSD": ArbiesAssets.SUI,
  "XRPUSD": ArbiesAssets.XRP,
  "AAVEUSD": ArbiesAssets.AAVE,
  "ENAUSD": ArbiesAssets.ENA,
  "FARTCOINUSD": ArbiesAssets.FARTCOIN,
  "PUMPUSD": ArbiesAssets.PUMP,
  "ZECUSD": ArbiesAssets.ZEC,
  "MONUSD": ArbiesAssets.MON,
  "XMRUSD": ArbiesAssets.XMR,
  "LITUSD": ArbiesAssets.LIT,
  "BERAUSD": ArbiesAssets.BERA,
}

const EtherealApiUrl = "https://api.ethereal.trade/v1";

const EtherealApiUrlEndpoints = {
  product: "/product",
  projectedFunding: "/funding/projected-rate",
};

type EtherealProjectedFunding = {
  productId: string;
  fundingRateProjected1h: number;
};

async function getIdsAndTickers(assets: AssetValues[]): Promise<Map<string, keyof typeof EtherealPairRegistry>> {
  const res = await fetch(
    EtherealApiUrl + EtherealApiUrlEndpoints.product,
    {
      method: "GET",
      headers: { accept: "application/json" },
    }
  );
  const data = await res.json();
  if (!data || !data.data || data.data.length === 0) {
    return new Map();
  }

  const ids: Map<string, keyof typeof EtherealPairRegistry> = new Map();
  for (const listing of data.data) {
    if (assets.includes(EtherealPairRegistry[listing.ticker])) {
      ids.set(listing.id, listing.ticker);
    }
  }
  return ids;
}

export const EtherealDex = {
  Name: "Ethereal",
  PairRegistry: EtherealPairRegistry,
  ApiUrl: EtherealApiUrl,
  ApiUrlEndpoints: EtherealApiUrlEndpoints,

  async GetCurrentFunding(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const pairs: AssetValues[] = (searchParams.get(HTTPParams.assets)?.split(",") as AssetValues[]) || [];

    const idsAndTickers = await getIdsAndTickers(pairs);

    const res = await fetch(
      EtherealApiUrl + EtherealApiUrlEndpoints.projectedFunding
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
      .filter((listing: EtherealProjectedFunding) => pairs.includes(EtherealPairRegistry[idsAndTickers.get(listing.productId)!]))
      .map((universe: EtherealProjectedFunding) => {
        if (!idsAndTickers.has(universe.productId)) {
          return null;
        }
        return {
          name: EtherealPairRegistry[idsAndTickers.get(universe.productId)!],
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
