import { LighterPairRegistry } from "./lighter"
import { HLPairRegistry } from "./hyperliquid"

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

export const DexesPairsMapping = {
  [AllDexes.Hyperliquid]: HLPairRegistry,
  [AllDexes.Lighter]: LighterPairRegistry,
}