import { DexValues } from "@/lib/funding/dexes/arbies";
import { AllDexes } from "@/lib/funding/dexes/arbies";
import { HTTPParams } from "@/app/api/req-params";
import { AssetValues } from "@/lib/funding/assets";
import { AssetAndFdg } from "@/app/api/funding/utils";

export function fetchoor(
  dexList: Set<DexValues>,
  assets: Set<AssetValues>,
  setFundingsPerDex: React.Dispatch<React.SetStateAction<Record<DexValues, AssetAndFdg[]>>>
) {
  for (const dex of dexList) {
    switch (dex) {
      case AllDexes.Hyperliquid:
        fetch('/api/funding/hyperliquid/funding'
          + '?' + HTTPParams.assets + '=' + Array.from(assets).join(','))
          .then(res => res.json())
          .then(data => {
            if (data.error) return console.error('err while fetching HL funding data:', data.error);
            setFundingsPerDex(prev => ({ ...prev, [dex]: data || [] }));
          })
          .catch(err => console.error(err));
        break;

      case AllDexes.Lighter:
        fetch('/api/funding/lighter/funding'
          + '?' + HTTPParams.assets + '=' + Array.from(assets).join(','))
          .then(res => res.json())
          .then(data => {
            if (data.error) return console.error('err while fetching Lighter funding data:', data.error);
            setFundingsPerDex(prev => ({ ...prev, [dex]: data || [] }));
          })
          .catch(err => console.error(err));
        break;

      case AllDexes.QFEX:
        fetch('/api/funding/qfex/funding'
          + '?' + HTTPParams.assets + '=' + Array.from(assets).join(','))
          .then(res => res.json())
          .then(data => {
            if (data.error) return console.error('err while fetching QFEX funding data:', data.error);
            setFundingsPerDex(prev => ({ ...prev, [dex]: data || [] }));
          })
          .catch(err => console.error(err));
        break;

      case AllDexes.Extended:
        fetch('/api/funding/extended/funding'
          + '?' + HTTPParams.assets + '=' + Array.from(assets).join(','))
          .then(res => res.json())
          .then(data => {
            if (data.error) return console.error('err while fetching Extended funding data:', data.error);
            setFundingsPerDex(prev => ({ ...prev, [dex]: data || [] }));
          })
          .catch(err => console.error(err));
        break;

      case AllDexes.Variational:
        fetch('/api/funding/variational/funding'
          + '?' + HTTPParams.assets + '=' + Array.from(assets).join(','))
          .then(res => res.json())
          .then(data => {
            if (data.error) return console.error('err while fetching Variational funding data:', data.error);
            setFundingsPerDex(prev => ({ ...prev, [dex]: data || [] }));
          })
          .catch(err => console.error(err));
        break;

      case AllDexes.Pacifica:
        fetch('/api/funding/pacifica/funding'
          + '?' + HTTPParams.assets + '=' + Array.from(assets).join(','))
          .then(res => res.json())
          .then(data => {
            if (data.error) return console.error('err while fetching Pacifica funding data:', data.error);
            setFundingsPerDex(prev => ({ ...prev, [dex]: data || [] }));
          })
          .catch(err => console.error(err));
        break;

      case AllDexes.Ethereal:
        fetch('/api/funding/ethereal/funding'
          + '?' + HTTPParams.assets + '=' + Array.from(assets).join(','))
          .then(res => res.json())
          .then(data => {
            if (data.error) return console.error('err while fetching Ethereal funding data:', data.error);
            setFundingsPerDex(prev => ({ ...prev, [AllDexes.Ethereal]: data || [] }));
          })
          .catch(err => console.error(err));
        break;

      case AllDexes.Paradex:
        fetch('/api/funding/paradex/funding'
          + '?' + HTTPParams.assets + '=' + Array.from(assets).join(','))
          .then(res => res.json())
          .then(data => {
            if (data.error) return console.error('err while fetching Paradex funding data:', data.error);
            setFundingsPerDex(prev => ({ ...prev, [AllDexes.Paradex]: data || [] }));
          })
          .catch(err => console.error(err));
        break;

      case AllDexes["01"]:
        fetch('/api/funding/01/funding'
          + '?' + HTTPParams.assets + '=' + Array.from(assets).join(','))
          .then(res => res.json())
          .then(data => {
            if (data.error) return console.error('err while fetching 01 funding data:', data.error);
            setFundingsPerDex(prev => ({ ...prev, [AllDexes['01']]: data || [] }));
          })
          .catch(err => console.error(err));
        break;

      default:
        console.error('Unknown dex:', dex);
    }
  }
}