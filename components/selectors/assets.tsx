import * as React from "react"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Button } from "@/components/ui/button";
import { PairRecord } from "@/lib/pairs";

export default function AssetSelector(
  { selected,
    setSelected,
    defaultSelected,
    disabled = false,
  }: {
    selected: string[];
    setSelected: React.Dispatch<React.SetStateAction<string[]>>;
    defaultSelected: boolean;
    disabled?: boolean;
  }) {

  const [assets, setAssets] = React.useState<string[]>([]);
  const [open, setOpen] = React.useState(false);
  const toggle = (opt: string) => {
    if (disabled) return;

    if (selected.includes(opt)) {
      setSelected(selected.filter(s => s !== opt));
    }
    else {
      setSelected([...selected, opt]);
    }
  }

  React.useEffect(() => {
    fetch("/api/pairs/list")
      .then(res => res.json())
      .then((res: PairRecord) => {
        setAssets(Object.values(res).map((opt) => opt.asset));
        setSelected(defaultSelected ? Object.values(res).map((opt) => opt.asset) : []);
      });
  }, [])

  return (
    <Popover
      open={open}
      onOpenChange={(nextOpen) => {
        disabled ? setOpen(false) : setOpen(nextOpen);
      }}
    >
      <PopoverTrigger>
        <Button className="cursor-pointer" disabled={disabled}>Select assets</Button>
      </PopoverTrigger>

      <PopoverContent
        className="w-30 p-1 gap-1"
        side="bottom"
        align="start"
        sideOffset={4}
        sticky="partial"
      >
        {assets.map((opt) => (
          <div
            key={opt}
            className="flex w-full min-h-10 items-center gap-3 rounded-md px-3 transition-colors hover:bg-accent/60 cursor-pointer"
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