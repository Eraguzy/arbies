import { ArbiesAssets, AssetValues } from "@/lib/funding/assets"
import { HTTPParams } from "@/app/api/req-params"
import { AssetAndFdg, annualizeHourlyFunding } from "@/app/api/funding/utils"
import type { Dex } from "@/lib/funding/dexes/arbies"
import { NextRequest, NextResponse } from "next/server"
import { DexApiError, fetchDexJSON, dexErrorCatcher } from "@/lib/funding/misc"

// match pacifica pairs with the local registry
export const PacificaPairRegistry: Record<string, AssetValues> = {
  "2Z": ArbiesAssets["2Z"],
  "AAVE": ArbiesAssets.AAVE,
  "ADA": ArbiesAssets.ADA,
  "ARB": ArbiesAssets.ARB,
  "ASTER": ArbiesAssets.ASTER,
  "AVAX": ArbiesAssets.AVAX,
  "BCH": ArbiesAssets.BCH,
  "BNB": ArbiesAssets.BNB,
  "BP": ArbiesAssets.BP,
  "BTC": ArbiesAssets.BTC,
  "CHIP": ArbiesAssets.CHIP,
  "CL": ArbiesAssets.CL,
  "COPPER": ArbiesAssets.XCU,
  "CRCL": ArbiesAssets.CRCL,
  "CRV": ArbiesAssets.CRV,
  "DOGE": ArbiesAssets.DOGE,
  "DRAM": ArbiesAssets.DRAM,
  "ENA": ArbiesAssets.ENA,
  "ETH": ArbiesAssets.ETH,
  "EURUSD": ArbiesAssets.EURUSD,
  "FARTCOIN": ArbiesAssets.FARTCOIN,
  "GOOGL": ArbiesAssets.GOOGL,
  "HOOD": ArbiesAssets.HOOD,
  "HYPE": ArbiesAssets.HYPE,
  "ICP": ArbiesAssets.ICP,
  "JUP": ArbiesAssets.JUP,
  "KAITO": ArbiesAssets.KAITO,
  "kBONK": ArbiesAssets.BONK,
  "kPEPE": ArbiesAssets.PEPE,
  "kSHIB": ArbiesAssets.SHIB,
  "LDO": ArbiesAssets.LDO,
  "LINK": ArbiesAssets.LINK,
  "LIT": ArbiesAssets.LIT,
  "LTC": ArbiesAssets.LTC,
  "MEGA": ArbiesAssets.MEGA,
  "META": ArbiesAssets.META,
  "MON": ArbiesAssets.MON,
  "MSTR": ArbiesAssets.MSTR,
  "MU": ArbiesAssets.MU,
  "NATGAS": ArbiesAssets.NATGAS,
  "NEAR": ArbiesAssets.NEAR,
  "NVDA": ArbiesAssets.NVDA,
  "PAXG": ArbiesAssets.PAXG,
  "PENGU": ArbiesAssets.PENGU,
  "PIPPIN": ArbiesAssets.PIPPIN,
  "PLATINUM": ArbiesAssets.XPT,
  "PLTR": ArbiesAssets.PLTR,
  "PONS": ArbiesAssets.PONS,
  "PUMP": ArbiesAssets.PUMP,
  "SAMSUNG": ArbiesAssets.SAMSUNG,
  "SKHYNIX": ArbiesAssets.SKHYNIX,
  "SNDK": ArbiesAssets.SNDK,
  "SOL": ArbiesAssets.SOL,
  "SP500": ArbiesAssets.SPY500,
  "SPCX": ArbiesAssets.SPCX,
  "STRK": ArbiesAssets.STRK,
  "SUI": ArbiesAssets.SUI,
  "TAO": ArbiesAssets.TAO,
  "TRUMP": ArbiesAssets.TRUMP,
  "TSLA": ArbiesAssets.TSLA,
  "UNI": ArbiesAssets.UNI,
  "URNM": ArbiesAssets.URA,
  "USDJPY": ArbiesAssets.USDJPY,
  "USELESS": ArbiesAssets.USELESS,
  "VIRTUAL": ArbiesAssets.VIRTUAL,
  "VVV": ArbiesAssets.VVV,
  "WIF": ArbiesAssets.WIF,
  "WLD": ArbiesAssets.WLD,
  "WLFI": ArbiesAssets.WLFI,
  "XAG": ArbiesAssets.XAG,
  "XAU": ArbiesAssets.XAU,
  "XMR": ArbiesAssets.XMR,
  "XPL": ArbiesAssets.XPL,
  "XRP": ArbiesAssets.XRP,
  "ZEC": ArbiesAssets.ZEC,
  "ZK": ArbiesAssets.ZK,
  "ZRO": ArbiesAssets.ZRO,
  "XTEN": ArbiesAssets.XTEN,
  "ANT": ArbiesAssets.ANTHROPIC,
}

const PacificaApiUrl = "https://api.pacifica.fi/api/v1";

const PacificaApiUrlEndpoints = {
  marketInfo: "/info",
};

type PacificaData = {
  symbol: string;
  next_funding_rate: string;
};

export const PacificaDex: Dex = {
  Name: "Pacifica",
  PairRegistry: PacificaPairRegistry,
  ApiUrl: PacificaApiUrl,
  ApiUrlEndpoints: PacificaApiUrlEndpoints,

  async GetCurrentFunding(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const pairs = searchParams.get(HTTPParams.assets)?.split(",") || [];

    const PacificaApiTimeoutMs = 5000;

    const url = PacificaApiUrl + PacificaApiUrlEndpoints.marketInfo;
    let result;
    try {
      result = await fetchDexJSON(
        PacificaDex.Name,
        url,
        {
          method: "GET",
          headers: { accept: "application/json" },
        },
        PacificaApiTimeoutMs,
      );
      if (!result) {
        throw new DexApiError(PacificaDex.Name, url, "invalid-data");
      }
      if (!result.success) {
        throw new DexApiError(PacificaDex.Name, url, "invalid-data", { cause: result.error });
      }
      if (!Array.isArray(result.data) || result.data.length === 0) {
        throw new DexApiError(PacificaDex.Name, url, "invalid-data");
      }
    } catch (err) {
      return dexErrorCatcher(PacificaDex.Name, err);
    }

    const assetsAndFundings: AssetAndFdg[] = result.data
      .filter((listing: PacificaData) => pairs.includes(PacificaPairRegistry[listing.symbol]))
      .map((universe: PacificaData) => {
        return {
          name: PacificaPairRegistry[universe.symbol],
          funding: annualizeHourlyFunding(Number(universe.next_funding_rate)),
        };
      });

    return NextResponse.json(assetsAndFundings);
  },

  GetHstyFunding() {
    return undefined;
  },
}
