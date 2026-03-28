import * as React from "react"
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  useComboboxAnchor,
} from "@/components/ui/combobox"
import { ArbiesAssets, AssetValues } from "@/lib/funding/assets";

export default function AssetSelector(
  { selected,
    setSelected,
    defaultSelected,
    disabled
  }: {
    selected: AssetValues[];
    setSelected: React.Dispatch<React.SetStateAction<AssetValues[]>>;
    defaultSelected: boolean;
    disabled?: boolean;
  }) {

  React.useEffect(() => {
    if (defaultSelected) {
      setSelected(Object.values(ArbiesAssets));
    }
  }, []);

  const anchor = useComboboxAnchor();

  return (
    <Combobox
      items={Object.values(ArbiesAssets)}
      multiple
      value={selected}
      onValueChange={setSelected}
      disabled={disabled}
    >
      <ComboboxInput placeholder="Select assets" className="w-35" />
      <ComboboxContent anchor={anchor} className="w-35">
        <ComboboxEmpty>No items found.</ComboboxEmpty>
        <ComboboxList>
          {(item) => (
            <ComboboxItem key={item} value={item}>
              {item}
            </ComboboxItem>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  );
}