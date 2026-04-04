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
import { Button } from "@/components/ui/button"
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
  const hasAllSelected = selected.length === Object.values(ArbiesAssets).length;

  const toggleSelectAll = () => {
    setSelected(hasAllSelected ? [] : Object.values(ArbiesAssets));
  };

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
        <div className="border-b border-border bg-popover p-1">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-7 w-full justify-start hover:cursor-pointer"
            onClick={toggleSelectAll}
            disabled={disabled}
          >
            {hasAllSelected ? "Deselect all" : "Select all"}
          </Button>
        </div>
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