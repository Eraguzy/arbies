import { useContext, useEffect, useState, createContext } from "react";
import { Table, TableCaption, TableHeader, TableRow, TableHead, TableBody } from "@/components/ui/table";

import { FundingContext } from "../page";
import { fetchoor } from "./fetchoor";
import { readStoredAssets, writeStoredAssets } from "../../../lib/funding/browserStorage";
import { DexName } from "@/lib/funding/dexes/arbies";
import { AssetAndFdg } from "@/app/api/funding/utils";
import { AssetValues } from "@/lib/funding/assets";
import AssetSelector from "@/components/selectors/assets";
import { ComparisonModeRows } from "./comparison-module";
import { FundingModeRows } from "./funding-module";
import { DexLabel } from "./dex-label";

export const FundingsCtx = createContext({} as Record<DexName, AssetAndFdg[]>);
export const DexesLoadingCtx = createContext({} as Record<DexName, boolean>);

export default function TableFundings() {
  const { selected, comparisonMode } = useContext(FundingContext);
  const [assets, setAssets] = useState<AssetValues[]>(() => readStoredAssets());
  const [fundingsPerDex, setFundingsPerDex] = useState<Record<DexName, AssetAndFdg[]>>({} as Record<DexName, AssetAndFdg[]>);
  const [isDexLoading, setIsDexLoading] = useState<Record<DexName, boolean>>({} as Record<DexName, boolean>);
  const [isDexFirstLoad, setIsDexFirstLoad] = useState<Record<DexName, boolean>>({} as Record<DexName, boolean>); // skeletons only show on 1st dex load
  const [dexErrors, setDexErrors] = useState<Partial<Record<DexName, string>>>({}); // last fetch error per dex

  useEffect(() => {
    writeStoredAssets(assets);

    if (!assets.length) return;

    fetchoor(
      new Set(selected),
      new Set(assets),
      setFundingsPerDex,
      setIsDexLoading,
      setIsDexFirstLoad,
      setDexErrors
    ); // immediate call

    const interval = setInterval(() => {
      fetchoor(
        new Set(selected),
        new Set(assets),
        setFundingsPerDex,
        setIsDexLoading,
        setIsDexFirstLoad,
        setDexErrors
      );
    }, 60000); // fetch every minute

    return () => clearInterval(interval); // cleanup 
  }, [assets, selected]);

  const showSkeletonPerDex = Object.fromEntries(
    Object.entries(isDexLoading).map(
      // three isDexFirstLoad states: already loaded (false), 1st load (true), not yet loaded (undefined)
      ([dex, isLoading]) => [dex, isLoading && (isDexFirstLoad[dex as DexName] ?? true)]
    )
  ) as Record<DexName, boolean>;

  return (
    <Table>
      {selected.length !== 0 && <TableCaption>Click on a cell to view history (WIP)</TableCaption>}

      <TableHeader>
        <TableRow>
          {selected.length === 0 ? (
            <TableHead className="flex items-center justify-center bg-secondary">Select a DEX to view history</TableHead>
          ) : (
            <>
              <TableHead className="w-25 bg-secondary">
                <AssetSelector
                  selected={assets}
                  setSelected={setAssets}
                  disabled={selected.length === 0}
                />
              </TableHead>
              {selected.map((dex) => (
                <TableHead key={dex} className="w-25 bg-secondary"><DexLabel dex={dex} error={dexErrors[dex]} /></TableHead>
              ))}
            </>
          )}
        </TableRow>
      </TableHeader>

      <FundingsCtx value={fundingsPerDex}>
        <DexesLoadingCtx value={showSkeletonPerDex}>
          <TableBody>
            {comparisonMode ? (
              <ComparisonModeRows assets={assets} dexErrors={dexErrors} />
            ) :
              <FundingModeRows assets={assets} setAssets={setAssets} />
            }
          </TableBody>
        </DexesLoadingCtx>
      </FundingsCtx>
    </Table>
  )
}