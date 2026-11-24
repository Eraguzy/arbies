import { ArbiesAssets, AssetValues } from "@/lib/funding/assets"
import { HTTPParams } from "@/app/api/req-params"
import { AssetAndFdg, annualizeHourlyFunding } from "@/app/api/funding/utils"
import type { Dex } from "@/lib/funding/dexes/arbies"
import { NextRequest, NextResponse } from "next/server"
import { DexApiError, fetchDexJSON, dexErrorCatcher } from "@/lib/funding/misc"

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

const MeridianApiTimeoutMs = 5000;

type MeridianData = {
  productId: string;
  fundingRateProjected1h: string;
};

/** @throws DexApiError */
async function getIdsAndTickers(assets: AssetValues[]): Promise<Map<string, keyof typeof MeridianPairRegistry>> {
  const url = MeridianApiUrl + MeridianApiUrlEndpoints.product;
  const data = await fetchDexJSON(
    MeridianDex.Name,
    url,
    {
      method: "GET",
      headers: { accept: "application/json" },
    },
    MeridianApiTimeoutMs,
  );
  if (!data || !Array.isArray(data.data)) {
    throw new DexApiError(MeridianDex.Name, url, "invalid-data");
  }

  const ids: Map<string, keyof typeof MeridianPairRegistry> = new Map();
  for (const listing of data.data) {
    if (assets.includes(MeridianPairRegistry[listing.ticker])) {
      ids.set(listing.id, listing.ticker);
    }
  }
  return ids;
}

export const MeridianDex: Dex = {
  Name: "Meridian",
  PairRegistry: MeridianPairRegistry,
  ApiUrl: MeridianApiUrl,
  ApiUrlEndpoints: MeridianApiUrlEndpoints,

  async GetCurrentFunding(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const pairs: AssetValues[] = (searchParams.get(HTTPParams.assets)?.split(",") as AssetValues[]) || [];

    // without ids no funding can be fetched: any failure here fails the whole route
    let idsAndTickers: Map<string, keyof typeof MeridianPairRegistry>;
    try {
      idsAndTickers = await getIdsAndTickers(pairs);
    } catch (err) {
      console.error(MeridianDex.Name + ": failed to fetch products:", err);
      return dexErrorCatcher(MeridianDex.Name, err);
    }
    if (idsAndTickers.size === 0) {
      return NextResponse.json<AssetAndFdg[]>([]);
    }

    const url = MeridianApiUrl + MeridianApiUrlEndpoints.projectedFunding
      + "?productIds=" + Array.from(idsAndTickers.keys()).join("&productIds=");
    let result;
    try {
      result = await fetchDexJSON(
        MeridianDex.Name,
        url,
        {
          method: "GET",
          headers: { accept: "application/json" },
        },
        MeridianApiTimeoutMs,
      );
      if (!result || !Array.isArray(result.data)) {
        throw new DexApiError(MeridianDex.Name, url, "invalid-data");
      }
    } catch (err) {
      return dexErrorCatcher(MeridianDex.Name, err);
    }

    const assetsAndFundings: AssetAndFdg[] = result.data
      .filter((listing: MeridianData) => pairs.includes(MeridianPairRegistry[idsAndTickers.get(listing.productId)!]))
      .map((universe: MeridianData) => {
        if (!idsAndTickers.has(universe.productId)) return null;

        return {
          name: MeridianPairRegistry[idsAndTickers.get(universe.productId)!],
          funding: annualizeHourlyFunding(Number(universe.fundingRateProjected1h)),
        };
      })
      .filter((value: AssetAndFdg | null): value is AssetAndFdg => value !== null);

    return NextResponse.json(assetsAndFundings);
  },

  GetHstyFunding() {
    return undefined;
  },
}
