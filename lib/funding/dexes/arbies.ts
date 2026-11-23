import { NextRequest, NextResponse } from "next/server"

import { AssetAndFdg } from "@/app/api/funding/utils"
import { AssetValues } from "../assets"
import { ZoDex } from "./01"
import { MeridianDex } from "./meridian"
import { ExtndDex } from "./extended"
import { HLDex } from "./hyperliquid"
import { LighterDex } from "./lighter"
import { PacificaDex } from "./pacifica"
import { ParadexDex } from "./paradex"
import { QFEXDex } from "./qfex"
import { VariDex } from "./variational"
import { RisexDex } from "./risex";

export type DexName =
  | "Hyperliquid"
  | "Lighter"
  | "QFEX"
  | "Extended"
  | "Variational"
  | "Pacifica"
  | "Meridian"
  | "Paradex"
  | "01"
  | "RISEx";

export type ApiUrlEndpoints = Record<
  string,
  string | ((arg: number) => string)
>;

export type Dex = {
  Name: DexName;
  PairRegistry: Record<string, AssetValues>;
  ApiUrl: string;
  ApiUrlEndpoints: ApiUrlEndpoints;
  GetCurrentFunding: (request: NextRequest) => Promise<
    NextResponse<{ error: string; }> |
    NextResponse<AssetAndFdg[]>
  >
  GetHstyFunding: (request: NextRequest) => unknown // not designed yet
}

const dexList: Dex[] = [
  HLDex,
  LighterDex,
  QFEXDex,
  ExtndDex,
  VariDex,
  PacificaDex,
  MeridianDex,
  ParadexDex,
  ZoDex,
  RisexDex,
];
export const AllDexes = Object.fromEntries(dexList.map((dex) => [dex.Name, dex])) as Record<DexName, Dex>;