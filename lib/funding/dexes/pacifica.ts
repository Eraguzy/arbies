import { ArbiesAssets, AssetValues } from "@/lib/funding/assets"
import { HTTPParams } from "@/app/api/req-params"
import { AssetAndFdg, annualizeHourlyFunding } from "@/app/api/funding/utils"
import type { Dex } from "@/lib/funding/dexes/arbies"
import { NextRequest, NextResponse } from "next/server"

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
    "CL": ArbiesAssets.CL,
    "COPPER": ArbiesAssets.XCU,
    "CRCL": ArbiesAssets.CRCL,
    "CRV": ArbiesAssets.CRV,
    "DOGE": ArbiesAssets.DOGE,
    "ENA": ArbiesAssets.ENA,
    "ETH": ArbiesAssets.ETH,
    "EURUSD": ArbiesAssets.EURUSD,
    "FARTCOIN": ArbiesAssets.FARTCOIN,
    "GOOGL": ArbiesAssets.GOOGL,
    "HOOD": ArbiesAssets.HOOD,
    "HYPE": ArbiesAssets.HYPE,
    "ICP": ArbiesAssets.ICP,
    "JUP": ArbiesAssets.JUP,
    "kBONK": ArbiesAssets["1000BONK"],
    "kPEPE": ArbiesAssets["1000PEPE"],
    "LDO": ArbiesAssets.LDO,
    "LINK": ArbiesAssets.LINK,
    "LIT": ArbiesAssets.LIT,
    "LTC": ArbiesAssets.LTC,
    "MEGA": ArbiesAssets.MEGA,
    "MON": ArbiesAssets.MON,
    "NATGAS": ArbiesAssets.NATGAS,
    "NEAR": ArbiesAssets.NEAR,
    "NVDA": ArbiesAssets.NVDA,
    "PAXG": ArbiesAssets.PAXG,
    "PENGU": ArbiesAssets.PENGU,
    "PIPPIN": ArbiesAssets.PIPPIN,
    "PLATINUM": ArbiesAssets.XPT,
    "PLTR": ArbiesAssets.PLTR,
    "PUMP": ArbiesAssets.PUMP,
    "SOL": ArbiesAssets.SOL,
    "SP500": ArbiesAssets.SP500,
    "STRK": ArbiesAssets.STRK,
    "SUI": ArbiesAssets.SUI,
    "TAO": ArbiesAssets.TAO,
    "TRUMP": ArbiesAssets.TRUMP,
    "TSLA": ArbiesAssets.TSLA,
    "UNI": ArbiesAssets.UNI,
    "URNM": ArbiesAssets.URA,
    "USDJPY": ArbiesAssets.USDJPY,
    "VIRTUAL": ArbiesAssets.VIRTUAL,
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
}

const PacificaApiUrl = "https://api.pacifica.fi/api/v1";

const PacificaApiUrlEndpoints = {
    marketInfo: "/info",
};

type PacificaData = {
    symbol: string;
    next_funding_rate: number;
};

export const PacificaDex = {
    Name: "Pacifica",
    PairRegistry: PacificaPairRegistry,
    ApiUrl: PacificaApiUrl,
    ApiUrlEndpoints: PacificaApiUrlEndpoints,

    async GetCurrentFunding(request: NextRequest) {
        const { searchParams } = new URL(request.url);
        const pairs = searchParams.get(HTTPParams.assets)?.split(",") || [];

        const res = await fetch(
            PacificaApiUrl + PacificaApiUrlEndpoints.marketInfo,
            {
                method: "GET",
                headers: { accept: "application/json" },
            }
        );
        const data = await res.json();
        if (!data || !data.data || data.data.length === 0) {
            return NextResponse.json({ error: "No data found" }, { status: 404 });
        }
        if (!data.success) {
            return NextResponse.json({ error: "Error fetching data from Pacifica" }, { status: 500 });
        }

        const assetsAndFundings: AssetAndFdg[] = data.data
            .filter((listing: PacificaData) => pairs.includes(PacificaPairRegistry[listing.symbol]))
            .map((universe: PacificaData) => {
                return {
                    name: PacificaPairRegistry[universe.symbol],
                    funding: annualizeHourlyFunding(universe.next_funding_rate),
                };
            });

        return NextResponse.json(assetsAndFundings);
    },

    GetHstyFunding() {
        return undefined;
    },
} satisfies Dex
