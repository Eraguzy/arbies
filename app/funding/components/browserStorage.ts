import { AllDexes, DexValues } from "@/lib/funding/dexes/arbies";
import { AssetValues, ArbiesAssets } from "@/lib/funding/assets";

export const storageKeys = {
  selectedDexes: "arbies:funding:selected-dexes",
  comparedDexes: "arbies:funding:compared-dexes",
  assets: "arbies:funding:selected-assets",
} as const;

// some magic to keep a consistent order of assets in the UI based on what's in ArbiesAssets
const canonicalAssetOrder = Object.values(ArbiesAssets);
const canonicalAssetIndex = new Map(
  canonicalAssetOrder.map((asset, index) => [asset, index]),
);

// read either selected or compared dexes from local storage
export function readStoredDexes(key: string, fallback: DexValues[]): DexValues[] {
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return fallback;

    const dexes = parsed.filter(
      (value): value is DexValues => typeof value === "string" &&
        Object.values(AllDexes).includes(value as DexValues)
    );
    return dexes;
  } catch {
    return fallback;
  }
}

// read selected assets from local storage
export function readStoredAssets(): AssetValues[] {
  try {
    const raw = window.localStorage.getItem(storageKeys.assets);
    if (!raw) return canonicalAssetOrder;

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return canonicalAssetOrder;

    const assets = parsed.filter(
      (value): value is AssetValues => typeof value === "string"
        && canonicalAssetOrder.includes(value as AssetValues)
    );

    return assets.sort(
      (a, b) => (canonicalAssetIndex.get(a) ?? Infinity) // put unknown assets at the end
        - (canonicalAssetIndex.get(b) ?? Infinity),
    );
  } catch {
    return canonicalAssetOrder;
  }
}

export function writeStoredAssets(assets: AssetValues[]) {
  const orderedAssets = [...assets].sort(
    (a, b) => (canonicalAssetIndex.get(a) ?? Infinity) // put unknown assets at the end
      - (canonicalAssetIndex.get(b) ?? Infinity),
  );

  window.localStorage.setItem(storageKeys.assets, JSON.stringify(orderedAssets));
}