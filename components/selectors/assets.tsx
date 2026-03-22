import * as React from "react"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Button } from "@/components/ui/button";
import { ArbiesAssets, AssetValues } from "@/lib/funding/assets";
import { ChevronDown } from 'lucide-react';

export default function AssetSelector(
  { selected,
    setSelected,
    defaultSelected,
    disabled = false,
  }: {
    selected: AssetValues[];
    setSelected: React.Dispatch<React.SetStateAction<AssetValues[]>>;
    defaultSelected: boolean;
    disabled?: boolean;
  }) {

  const [open, setOpen] = React.useState(false);
  const toggle = (opt: AssetValues) => {
    if (disabled) return;

    if (selected.includes(opt)) {
      setSelected(selected.filter(s => s !== opt));
    }
    else {
      setSelected([...selected, opt]);
    }
  }

  React.useEffect(() => {
    if (defaultSelected) {
      setSelected(Object.values(ArbiesAssets));
    }
  }, []);

  return (
    <Popover
      open={open}
      onOpenChange={(nextOpen) => {
        disabled ? setOpen(false) : setOpen(nextOpen);
      }}
    >
      <PopoverTrigger>
        <Button className="cursor-pointer bg-secondary text-foreground hover:bg-ring" disabled={disabled}>
          Select assets
          <ChevronDown className="h-4 w-4" />
        </Button>
      </PopoverTrigger>

      <PopoverContent
        className="w-30 p-1 gap-1"
        side="bottom"
        align="start"
        sideOffset={4}
        sticky="partial"
      >
        {Object.values(ArbiesAssets).map((opt) => (
          <div
            key={opt}
            className="flex w-full min-h-10 items-center gap-3 rounded-md px-3 transition-colors hover:bg-accent/60 cursor-pointer select-none"
            onClick={() => toggle(opt)}
          >
            <Checkbox
              checked={selected.includes(opt)}
              className="pointer-events-none bg-background"
            />
            {opt}
          </div>
        ))}
      </PopoverContent>
    </Popover>
  );
}