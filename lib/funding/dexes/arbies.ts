import { LighterPairRegistry } from "./lighter"
import { HLPairRegistry } from "./hyperliquid"
import { QFEXPairRegistry } from "./qfex"
import { AssetValues } from "../assets"
import { ExtndPairRegistry } from "./extended"
import { VariPairRegistry } from "./variational"
import { EtherealPairRegistry } from "./ethereal"
import { PacificaPairRegistry } from "./pacifica"
import { ParadexPairRegistry } from "./paradex"
import { ZoPairRegistry } from "./01"

export const AllDexes = {
  Hyperliquid: "Hyperliquid",
  Lighter: "Lighter",
  QFEX: "QFEX",
  Extended: "Extended",
  Variational: "Variational",
  Pacifica: "Pacifica",
  Ethereal: "Ethereal",
  // Paradex: "Paradex",
  "01": "01",
}

export type DexValues = typeof AllDexes[keyof typeof AllDexes]

export const DexesPairsMapping: Record<DexValues, Record<string, AssetValues>> = {
  [AllDexes.Hyperliquid]: HLPairRegistry,
  [AllDexes.Lighter]: LighterPairRegistry,
  [AllDexes.QFEX]: QFEXPairRegistry,
  [AllDexes.Extended]: ExtndPairRegistry,
  [AllDexes.Variational]: VariPairRegistry,
  [AllDexes.Pacifica]: PacificaPairRegistry,
  [AllDexes.Ethereal]: EtherealPairRegistry,
  // [AllDexes.Paradex]: ParadexPairRegistry,
  [AllDexes["01"]]: ZoPairRegistry,
}