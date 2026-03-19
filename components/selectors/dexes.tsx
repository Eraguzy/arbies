import * as React from "react"
import { Checkbox } from "@/components/ui/checkbox"
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover"
import { Button } from "@/components/ui/button";

export default function DexesSelector(
	{ selected,
		setSelected,
		multiple = false,
		defaultSelected,
		disabled = false,
	}: {
		selected: string[];
		setSelected: React.Dispatch<React.SetStateAction<string[]>>;
		multiple?: boolean;
		defaultSelected: boolean;
		disabled?: boolean;
	}) {

	const [dexes, setDexes] = React.useState<string[]>([]);
	const toggle = (opt: string) => {
		if (selected.includes(opt)) {
			setSelected(selected.filter(s => s !== opt));
		}
		else if (multiple) {
			setSelected([...selected, opt]);
		} else {
			setSelected([opt]);
		}
	}

	React.useEffect(() => {
		fetch("/api/dexes/list")
			.then(res => res.json())
			.then(res => {
				setDexes(res);
				setSelected(defaultSelected ? res : []);
			});
	}, [])

	return (
		<Popover>
			<PopoverTrigger>
				<Button className="cursor-pointer" disabled={disabled}>
					{multiple ?
						`Select DEXes` :
						(selected.length > 0 ?
							selected[0] :
							"Select DEX")
					}
				</Button>
			</PopoverTrigger>

			<PopoverContent
				className="w-30 p-1 gap-1"
				side="bottom"
				align="start"
				sideOffset={4}
				sticky="partial"
			>
				{dexes.map((opt) => (
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