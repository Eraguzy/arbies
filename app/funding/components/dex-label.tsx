import { TriangleAlert } from "lucide-react";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";

import { DexName } from "@/lib/funding/dexes/arbies";

// dex name + eventual error tooltip
export function DexLabel({ dex, error }: { dex: DexName, error?: string }) {
  return (
    <span className="inline-flex items-center gap-1">
      {dex}
      {error && (
        <Tooltip>
          <TooltipTrigger asChild>
            <button type="button" aria-label={error} className="cursor-help">
              <TriangleAlert className="size-3.5 text-amber-500" />
            </button>
          </TooltipTrigger>
          <TooltipContent>{error}</TooltipContent>
        </Tooltip>
      )}
    </span>
  );
}
