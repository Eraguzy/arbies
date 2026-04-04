import { AllDexes, DexValues } from "@/lib/funding/dexes/arbies";
import { AssetValues, ArbiesAssets } from "@/lib/funding/assets";

export const storageKeys = {
  selectedDexes: "arbies:funding:selected-dexes",
  comparedDexes: "arbies:funding:compared-dexes",
  assets: "arbies:funding:selected-assets",
} as const;

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
    if (!raw) return Object.values(ArbiesAssets);

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return Object.values(ArbiesAssets);

    const assets = parsed.filter(
      (value): value is AssetValues => typeof value === "string"
        && Object.values(ArbiesAssets).includes(value as AssetValues)
    );
    return assets;
  } catch {
    return Object.values(ArbiesAssets);
  }
}