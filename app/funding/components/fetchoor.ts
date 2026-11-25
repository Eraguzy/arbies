import { DexName } from "@/lib/funding/dexes/arbies";
import { HTTPParams } from "@/app/api/req-params";
import { AssetValues } from "@/lib/funding/assets";
import { AssetAndFdg } from "@/app/api/funding/utils";

export function fetchoor(
  dexList: Set<DexName>,
  assets: Set<AssetValues>,
  setFundingsPerDex: React.Dispatch<React.SetStateAction<Record<DexName, AssetAndFdg[]>>>,
  setIsDexLoading: React.Dispatch<React.SetStateAction<Record<DexName, boolean>>>,
  setIsDexFirstLoad: React.Dispatch<React.SetStateAction<Record<DexName, boolean>>>,
  setDexErrors: React.Dispatch<React.SetStateAction<Partial<Record<DexName, string>>>>
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
      .then(async res => {
        const data = await res.json().catch(() => null); // body is not json on a next 500 or a vercel timeout
        if (!res.ok) throw new Error(data?.error ?? 'Arbies server error (HTTP ' + res.status + ')');
        if (!Array.isArray(data)) throw new Error('Invalid response from arbies server');

        setFundingsPerDex(prev => ({ ...prev, [dex]: data }));
        setDexErrors(prev => ({ ...prev, [dex]: undefined })); // a successful fetch clears the warning
      })
      .catch(err => {
        console.error('err while fetching ' + dex + ' funding data:', err);
        setDexErrors(prev => ({ ...prev, [dex]: err instanceof Error ? err.message : String(err) }));
      })
      .finally(() => {
        setIsDexLoading(prev => ({ ...prev, [dex]: false }));
        setIsDexFirstLoad(prev => ({ ...prev, [dex]: false }));
      });
  };

  for (const dex of dexList) {
    fetchDexFunding(dex, '/api/funding/' + dex.toLowerCase() + '/funding');
  }
}
