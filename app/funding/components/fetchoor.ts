import { DexName } from "@/lib/funding/dexes/arbies";
import { HTTPParams } from "@/app/api/req-params";
import { AssetValues } from "@/lib/funding/assets";
import { AssetAndFdg } from "@/app/api/funding/utils";

export function fetchoor(
  dexList: Set<DexName>,
  assets: Set<AssetValues>,
  setFundingsPerDex: React.Dispatch<React.SetStateAction<Record<DexName, AssetAndFdg[]>>>,
  setIsDexLoading: React.Dispatch<React.SetStateAction<Record<DexName, boolean>>>,
  setIsDexFirstLoad: React.Dispatch<React.SetStateAction<Record<DexName, boolean>>>
) {
  const assetsParam = Array.from(assets).join(',');

  // filter out dexes removed from dexlist
  setIsDexFirstLoad(prev => {
    const kept = Object.fromEntries(
      Object.entries(prev).filter(([dex]) => dexList.has(dex as DexName))
    ) as Record<DexName, boolean>;

    return Object.keys(kept).length === Object.keys(prev).length ? prev : kept;
  });

  const fetchDexFunding = (dex: DexName, endpoint: string) => {
    setIsDexLoading(prev => ({ ...prev, [dex]: true }));

    fetch(endpoint + '?' + HTTPParams.assets + '=' + assetsParam)
      .then(res => res.json())
      .then(data => {
        if (data.error) {
          console.error(`err while fetching ${dex} funding data:`, data.error);
          return;
        }
        setFundingsPerDex(prev => ({ ...prev, [dex]: data || [] }));
      })
      .catch(err => console.error(err))
      .finally(() => {
        setIsDexLoading(prev => ({ ...prev, [dex]: false }));
        setIsDexFirstLoad(prev => ({ ...prev, [dex]: false }));
      });
  };

  for (const dex of dexList) {
    fetchDexFunding(dex, '/api/funding/' + dex.toLowerCase() + '/funding');
  }
}
