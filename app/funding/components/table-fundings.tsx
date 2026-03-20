import { DexesPairsMapping } from "@/lib/funding/dexes/arbies";
import { Table, TableCaption, TableHeader, TableRow, TableCell, TableHead, TableBody } from "@/components/ui/table";
import { useContext } from "react";
import { FundingContext } from "../page";

function ComparisonModeRows() {
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
          {
            // show the pair only if exists on the DEX
            DexesPairsMapping[dex] && Object.entries(DexesPairsMapping[dex]).length > 0 ? (
              Object.entries(DexesPairsMapping[dex]).map(([asset]) => (
                <TableRow key={asset}>
                  <TableCell className="h-10">{asset}</TableCell>
                </TableRow>
              ))
            ) : null
          }
        </>
      )
      }
    </>
  );
}

function FundingModeRows() {
  const { pairs } = useContext(FundingContext);

  return (
    <>
      {pairs.map((pair) => (
        <TableRow key={pair}>
          <TableCell className="h-10">{pair}</TableCell>
        </TableRow>
      ))}
    </>
  );
}

export default function TableFundings() {
  const { selected, comparisonMode } = useContext(FundingContext);

  return (
    <Table>
      {selected.length !== 0 && <TableCaption>Click on a cell to view history (WIP)</TableCaption>}

      <TableHeader>
        <TableRow>
          {
            selected.length === 0 ? (
              <TableHead className="flex items-center justify-center bg-secondary">Select a DEX to view history</TableHead>
            ) : (
              <>
                <TableHead className="w-25 bg-secondary">Asset</TableHead>
                {selected.map((dex) => (
                  <TableHead key={dex} className="w-25 bg-secondary">{dex}</TableHead>
                ))}
              </>
            )
          }
        </TableRow>
      </TableHeader>

      <TableBody>
        {comparisonMode ? (
          <ComparisonModeRows />
        ) :
          <FundingModeRows />
        }
      </TableBody>
    </Table >
  )
}