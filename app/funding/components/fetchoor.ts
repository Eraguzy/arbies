import { DexValues } from "@/lib/funding/dexes/arbies";
import { AllDexes } from "@/lib/funding/dexes/arbies";
import { HTTPParams } from "@/app/api/req-params";
import { AssetValues } from "@/lib/funding/assets";
import { AssetAndFdg } from "@/app/api/funding/utils";

export function fetchoor(
  dexList: Set<DexValues>,
  assets: Set<AssetValues>,
  setFundingsPerDex: React.Dispatch<React.SetStateAction<Record<DexValues, AssetAndFdg[]>>>,
  setIsDexLoading: React.Dispatch<React.SetStateAction<Record<DexValues, boolean>>>
) {
  const assetsParam = Array.from(assets).join(',');

  const fetchDexFunding = (dex: DexValues, endpoint: string) => {
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
      });
  };

  for (const dex of dexList) {
    fetchDexFunding(dex, '/api/funding/' + dex.toLowerCase() + '/funding');
  }
}