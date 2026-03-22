import { LighterPairRegistry } from "./lighter"
import { HLPairRegistry } from "./hyperliquid"
import { AssetValues } from "../assets"

export const AllDexes = {
  Hyperliquid: "Hyperliquid",
  Lighter: "Lighter",
  QFEX: "QFEX",
  Extended: "Extended",
  Variational: "Variational",
  Pacifica: "Pacifica",
  Ethereal: "Ethereal",
  Paradex: "Paradex",
  "01": "01",
}

export type DexValues = typeof AllDexes[keyof typeof AllDexes]

export const DexesPairsMapping: Record<DexValues, Record<string, AssetValues>> = {
  [AllDexes.Hyperliquid]: HLPairRegistry,
  [AllDexes.Lighter]: LighterPairRegistry,
}