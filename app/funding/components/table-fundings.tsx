import { useContext, useEffect, useState, createContext } from "react";
import { Table, TableCaption, TableHeader, TableRow, TableCell, TableHead, TableBody } from "@/components/ui/table";
import AssetSelector from "@/components/selectors/assets";
import { FundingContext } from "../page";
import { HTTPParams } from "@/app/api/req-params";
import { AllDexes, DexesPairsMapping, DexValues } from "@/lib/funding/dexes/arbies";
import { AssetAndFdg } from "@/app/api/funding/utils";
import { HLPairRegistry } from "@/lib/funding/dexes/hyperliquid";
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

function FundingModeRows({ assets }: { assets: AssetValues[] }) {
  const fundingsPerDex = useContext(FundingsCtx);
  const { selected } = useContext(FundingContext);

  return (<>
    {assets.map((pair: AssetValues) => (
      <TableRow key={pair}>
        <TableCell className="h-10">{pair}</TableCell>
        {
          selected.map((dex) => {
            const foundFunding = fundingsPerDex[dex]?.find(
              f => f.name === pair // at this point api should already have formatted f.name to arbies notation
            )?.funding;

            return (
              <TableCell key={dex} className="h-10">
                {
                  foundFunding !== undefined
                    ? foundFunding.toFixed(2) + ' %'
                    : 'N/A'
                }
              </TableCell>
            )
          })
        }
      </TableRow>
    ))}
  </>);
}

export const FundingsCtx = createContext({} as Record<DexValues, AssetAndFdg[]>);

export default function TableFundings() {
  const { selected, comparisonMode } = useContext(FundingContext);
  const [assets, setAssets] = useState<AssetValues[]>([]); // selected pairs
  // map dexes to their fundings for the selected pairs
  const [fundingsPerDex, setFundingsPerDex] = useState<Record<DexValues, AssetAndFdg[]>>({});

  useEffect(() => {
    if (!assets.length) return;

    const fetchFundings = () => {
      fetch('/api/funding/hyperliquid/funding'
        + '?' + HTTPParams.assets + '=' + assets.join(','))
        .then(res => res.json())
        .then(data => {
          if (data.error) return console.error('err while fetching HL funding data:', data.error);
          setFundingsPerDex(prev => ({ ...prev, [AllDexes.Hyperliquid]: data || [] }));
        })
        .catch(err => console.error(err));

      fetch('/api/funding/lighter/funding'
        + '?' + HTTPParams.assets + '=' + assets.join(','))
        .then(res => res.json())
        .then(data => {
          if (data.error) return console.error('err while fetching Lighter funding data:', data.error);
          setFundingsPerDex(prev => ({ ...prev, [AllDexes.Lighter]: data || [] }));
        })
        .catch(err => console.error(err));

      fetch('/api/funding/extended/funding'
        + '?' + HTTPParams.assets + '=' + assets.join(','))
        .then(res => res.json())
        .then(data => {
          if (data.error) return console.error('err while fetching Extended funding data:', data.error);
          setFundingsPerDex(prev => ({ ...prev, [AllDexes.Extended]: data || [] }));
        })
        .catch(err => console.error(err));

      fetch('/api/funding/variational/funding'
        + '?' + HTTPParams.assets + '=' + assets.join(','))
        .then(res => res.json())
        .then(data => {
          if (data.error) return console.error('err while fetching Variational funding data:', data.error);
          setFundingsPerDex(prev => ({ ...prev, [AllDexes.Variational]: data || [] }));
        })
        .catch(err => console.error(err));

      fetch('/api/funding/pacifica/funding'
        + '?' + HTTPParams.assets + '=' + assets.join(','))
        .then(res => res.json())
        .then(data => {
          if (data.error) return console.error('err while fetching Pacifica funding data:', data.error);
          setFundingsPerDex(prev => ({ ...prev, [AllDexes.Pacifica]: data || [] }));
        })
        .catch(err => console.error(err));

      fetch('/api/funding/ethereal/funding'
        + '?' + HTTPParams.assets + '=' + assets.join(','))
        .then(res => res.json())
        .then(data => {
          if (data.error) return console.error('err while fetching Ethereal funding data:', data.error);
          setFundingsPerDex(prev => ({ ...prev, [AllDexes.Ethereal]: data || [] }));
        })
        .catch(err => console.error(err));
    }

    fetchFundings(); // immediate call
    const interval = setInterval(() => {
      fetchFundings();
    }, 30000); // fetch every 30 seconds

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

      <FundingsCtx value={fundingsPerDex}>
        <TableBody>
          {comparisonMode ? (
            <ComparisonModeRows assets={assets} />
          ) :
            <FundingModeRows assets={assets} />
          }
        </TableBody>
      </FundingsCtx>
    </Table>
  )
}