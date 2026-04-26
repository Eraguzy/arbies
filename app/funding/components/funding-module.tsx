import { useContext } from "react";
import { TableRow, TableCell } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { X } from 'lucide-react'

import { FundingContext } from "../page";
import { AssetValues } from "@/lib/funding/assets";
import { FundingsCtx, DexesLoadingCtx } from "./table-fundings";

function FundingCell({ isLoading, mainFunding }: {
  isLoading: boolean,
  mainFunding: number | undefined,
}) {

  return (
    <TableCell className="h-10">
      {
        isLoading
          ? <Skeleton className="w-10 h-full" />
          : mainFunding != undefined
            ? mainFunding.toFixed(2) + ' %'
            : 'N/A'
      }
    </TableCell>
  );
}


export function FundingModeRows({
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
            const foundDexFunding =
              fundingsPerDex[dex]?.find(
                f => f.name === pair
              )?.funding;

            return (
              <FundingCell
                key={dex}
                isLoading={isDexLoading[dex]}
                mainFunding={foundDexFunding}
              />
            )
          })
        }
      </TableRow>
    ))
    }
  </>);
}