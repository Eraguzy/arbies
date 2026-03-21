import { useContext, useEffect, useState } from "react";
import { DexesPairsMapping } from "@/lib/funding/dexes/arbies";
import { Table, TableCaption, TableHeader, TableRow, TableCell, TableHead, TableBody } from "@/components/ui/table";
import AssetSelector from "@/components/selectors/assets";
import { FundingContext } from "../page";
import { HTTPParams } from "@/app/api/req-params";

function ComparisonModeRows({ assets }: { assets: string[] }) {
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
            Object.entries(DexesPairsMapping[dex]).map(([asset]) => {
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

function FundingModeRows({ assets }: { assets: string[] }) {
  useEffect(() => {
    if (!assets.length) return;

    const fetchFunding = () => {
      fetch('/api/funding/hyperliquid/funding'
        + '?' + HTTPParams.assets + '=' + assets.join(','))
        .then(res => res.json())
        .then(data => { console.log(data) })
        .catch(err => console.error(err));
    }

    fetchFunding(); // immediate call
    const interval = setInterval(() => {
      fetchFunding();
    }, 30000); // fetch every 30 seconds

    return () => clearInterval(interval); // cleanup 
  }, [assets]);

  return (
    <>
      {assets.map((pair) => (
        <TableRow key={pair}>
          <TableCell className="h-10">{pair}</TableCell>
        </TableRow>
      ))}
    </>
  );
}

export default function TableFundings() {
  const { selected, comparisonMode } = useContext(FundingContext);
  const [assets, setAssets] = useState<string[]>([]); // selected pairs

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
                  defaultSelected={true}
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

      <TableBody>
        {comparisonMode ? (
          <ComparisonModeRows assets={assets} />
        ) :
          <FundingModeRows assets={assets} />
        }
      </TableBody>
    </Table >
  )
}