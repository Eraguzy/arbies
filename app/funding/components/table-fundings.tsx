import { useContext, useEffect, useState, createContext } from "react";
import { Table, TableCaption, TableHeader, TableRow, TableCell, TableHead, TableBody } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import AssetSelector from "@/components/selectors/assets";
import { X } from 'lucide-react'

import { FundingContext } from "../page";
import { fetchoor } from "./fetchoor";
import { readStoredAssets, storageKeys, writeStoredAssets } from "./browserStorage";
import { DexesPairsMapping, DexValues } from "@/lib/funding/dexes/arbies";
import { AssetAndFdg } from "@/app/api/funding/utils";
import { AssetValues } from "@/lib/funding/assets";

function ComparisonModeRows({ assets }: { assets: AssetValues[] }) {
  const { selected, compared } = useContext(FundingContext);

  return (
    <>
      {compared.map((dex) =>
        <>
          <TableRow className="h-5 bg-accent" key={dex}>
            <TableCell className="h-5">{dex}</TableCell>
            {
              selected.map((s) => (
                <TableCell key={s} className="h-5">
                </TableCell>
              ))
            }
          </TableRow>
          {DexesPairsMapping[dex] && Object.entries(DexesPairsMapping[dex]).length > 0 ? (
            Object.values(DexesPairsMapping[dex]).map((asset) => {
              if (assets.includes(asset)) {
                return (
                  <TableRow key={asset}>
                    <TableCell className="h-10">{asset}</TableCell>
                  </TableRow>
                )
              }
              return null
            })
          ) : null}
        </>
      )}
    </>
  );
}

function FundingModeRows({
  assets,
  setAssets,
}: {
  assets: AssetValues[],
  setAssets: React.Dispatch<React.SetStateAction<AssetValues[]>>
}) {
  const fundingsPerDex = useContext(FundingsCtx);
  const isDexLoading = useContext(DexesLoadingCtx);
  const { selected } = useContext(FundingContext);

  const handleXClick = (asset: AssetValues) => {
    setAssets(prev => prev.filter(a => a !== asset));
  }

  return (<>
    {assets.map((pair: AssetValues) => (
      <TableRow key={pair}>
        <TableCell className="h-10 flex items-center">
          {pair}
          <X
            className="h-3 hover:cursor-pointer hover:text-white text-gray-500 transition-colors duration-100"
            onClick={() => handleXClick(pair)}
          />
        </TableCell>
        {
          selected.map((dex) => {
            const foundFunding = fundingsPerDex[dex]?.find(
              f => f.name === pair // at this point api should already have formatted f.name to arbies notation
            )?.funding;

            return (
              <TableCell key={dex} className="h-10">
                {
                  isDexLoading[dex]
                    ? <Skeleton className="w-10 h-full" />
                    : foundFunding !== undefined
                      ? foundFunding.toFixed(2) + ' %'
                      : 'N/A'
                }
              </TableCell>
            )
          })
        }
      </TableRow>
    ))
    }
  </>);
}

export const FundingsCtx = createContext({} as Record<DexValues, AssetAndFdg[]>);
export const DexesLoadingCtx = createContext({} as Record<DexValues, boolean>);

export default function TableFundings() {
  const { selected, comparisonMode } = useContext(FundingContext);
  const [assets, setAssets] = useState<AssetValues[]>(() => readStoredAssets()); // selected pairs
  // map dexes to their fundings for the selected pairs
  const [fundingsPerDex, setFundingsPerDex] = useState<Record<DexValues, AssetAndFdg[]>>({});
  const [isDexLoading, setIsDexLoading] = useState<Record<DexValues, boolean>>({});

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