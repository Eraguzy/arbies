import { Fragment, useContext, } from "react";
import { TableRow, TableCell } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";

import { FundingContext } from "../page";
import { DexesPairsMapping, DexValues } from "@/lib/funding/dexes/arbies";
import { AssetAndFdg } from "@/app/api/funding/utils";
import { AssetValues } from "@/lib/funding/assets";
import { FundingsCtx, DexesLoadingCtx } from "./table-fundings";

type DexFunding = {
  name: DexValues,
  assetAndFdg: AssetAndFdg,
}

function ComparisonCell({
  isLoading,
  mainFunding,
  secondFunding,
}: {
  isLoading: boolean,
  mainFunding: DexFunding,
  secondFunding: DexFunding,
}) {
  const mainFundingValue = mainFunding?.assetAndFdg?.funding;
  const secondFundingValue = secondFunding?.assetAndFdg?.funding;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <TableCell className="h-10">
          {
            isLoading
              ? <Skeleton className="w-10 h-full" />
              : mainFundingValue !== undefined && secondFundingValue !== undefined
                ? (mainFundingValue - secondFundingValue).toFixed(2) + ' %'
                : 'N/A'
          }
        </TableCell>
      </TooltipTrigger>
      <TooltipContent>
        {mainFunding.name}: {mainFundingValue !== undefined ? mainFundingValue.toFixed(2) + ' %' : 'N/A'}
        <br />
        {secondFunding.name}: {secondFundingValue !== undefined ? secondFundingValue.toFixed(2) + ' %' : 'N/A'}
      </TooltipContent>
    </Tooltip>
  );
}

export function ComparisonModeRows({ assets }: { assets: AssetValues[] }) {
  const { selected, compared } = useContext(FundingContext);
  const isDexLoading = useContext(DexesLoadingCtx);
  const fundingsPerDex = useContext(FundingsCtx);

  return (
    <>
      {compared.map((dex) =>
        <Fragment key={dex}>
          <TableRow className="h-5 bg-accent" key={dex}>
            <TableCell className="h-5">{dex}</TableCell>
            {
              selected.map((sel) => (
                <TableCell key={sel} className="h-5"></TableCell>
              ))
            }
          </TableRow>

          {Object.values(DexesPairsMapping[dex]).map((asset) => {
            if (!assets.includes(asset)) { return null; } // only show rows for assets that are selected in the asset selector

            return (
              <TableRow key={asset}>
                <TableCell className="h-10">{asset}</TableCell>
                {
                  selected.map((sel) => {
                    const foundSelFunding = {
                      name: sel,
                      assetAndFdg: fundingsPerDex[sel]?.find(
                        f => f.name === asset
                      ),
                    } as DexFunding;
                    const foundDexFunding = {
                      name: dex,
                      assetAndFdg: fundingsPerDex[dex]?.find(
                        f => f.name === asset
                      ),
                    } as DexFunding;

                    return (
                      <ComparisonCell
                        key={sel}
                        isLoading={isDexLoading[sel] || isDexLoading[dex]}
                        mainFunding={foundDexFunding}
                        secondFunding={foundSelFunding}
                      />

                    )
                  })
                }
              </TableRow>
            )
          })}
        </Fragment>
      )
      }
    </>
  );
}

