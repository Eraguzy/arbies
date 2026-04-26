import { useContext, useEffect, useState, createContext } from "react";
import { Table, TableCaption, TableHeader, TableRow, TableHead, TableBody } from "@/components/ui/table";

import { FundingContext } from "../page";
import { fetchoor } from "./fetchoor";
import { readStoredAssets, writeStoredAssets } from "../../../lib/funding/browserStorage";
import { DexValues } from "@/lib/funding/dexes/arbies";
import { AssetAndFdg } from "@/app/api/funding/utils";
import { AssetValues } from "@/lib/funding/assets";
import AssetSelector from "@/components/selectors/assets";
import { ComparisonModeRows } from "./comparison-module";
import { FundingModeRows } from "./funding-module";

export const FundingsCtx = createContext({} as Record<DexValues, AssetAndFdg[]>);
export const DexesLoadingCtx = createContext({} as Record<DexValues, boolean>);

export default function TableFundings() {
  const { selected, comparisonMode } = useContext(FundingContext);
  const [assets, setAssets] = useState<AssetValues[]>(() => readStoredAssets());
  const [fundingsPerDex, setFundingsPerDex] = useState<Record<DexValues, AssetAndFdg[]>>({} as Record<DexValues, AssetAndFdg[]>);
  const [isDexLoading, setIsDexLoading] = useState<Record<DexValues, boolean>>({} as Record<DexValues, boolean>);

  useEffect(() => {
    writeStoredAssets(assets);

    if (!assets.length) return;

    fetchoor(new Set(selected), new Set(assets), setFundingsPerDex, setIsDexLoading); // immediate call

    const interval = setInterval(() => {
      fetchoor(new Set(selected), new Set(assets), setFundingsPerDex, setIsDexLoading);
    }, 60000); // fetch every minute

    return () => clearInterval(interval); // cleanup 
  }, [assets]);

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
                <TableHead key={dex} className="w-25 bg-secondary">{dex}</TableHead>
              ))}
            </>
          )}
        </TableRow>
      </TableHeader>

      <FundingsCtx value={fundingsPerDex}>
        <DexesLoadingCtx value={isDexLoading}>
          <TableBody>
            {comparisonMode ? (
              <ComparisonModeRows assets={assets} />
            ) :
              <FundingModeRows assets={assets} setAssets={setAssets} />
            }
          </TableBody>
        </DexesLoadingCtx>
      </FundingsCtx>
    </Table>
  )
}