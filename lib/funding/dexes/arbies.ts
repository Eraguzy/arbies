import { NextRequest, NextResponse } from "next/server"

import { AssetAndFdg } from "@/app/api/funding/utils"
import { AssetValues } from "../assets"
import { ZoDex } from "./01"
import { EtherealDex } from "./ethereal"
import { ExtndDex } from "./extended"
import { HLDex } from "./hyperliquid"
import { LighterDex } from "./lighter"
import { PacificaDex } from "./pacifica"
import { ParadexDex } from "./paradex"
import { QFEXDex } from "./qfex"
import { VariDex } from "./variational"

export type DexName =
  | "Hyperliquid"
  | "Lighter"
  | "QFEX"
  | "Extended"
  | "Variational"
  | "Pacifica"
  | "Ethereal"
  | "Paradex"
  | "01";

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

export const AllDexes: Record<DexName, Dex> = {
  [HLDex.Name]: HLDex,
  [LighterDex.Name]: LighterDex,
  [QFEXDex.Name]: QFEXDex,
  [ExtndDex.Name]: ExtndDex,
  [VariDex.Name]: VariDex,
  [PacificaDex.Name]: PacificaDex,
  [EtherealDex.Name]: EtherealDex,
  [ParadexDex.Name]: ParadexDex,
  [ZoDex.Name]: ZoDex,
};