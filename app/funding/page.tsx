"use client";

import React from "react";
import DexesSelector from "@/components/selectors/dexes";
import AssetSelector from "@/components/selectors/assets";
import TableFundings from "./components/table-fundings";

export const FundingContext = React.createContext({
	selected: [] as string[], // horizontal axis
	compared: [] as string[], // vertical axis
	pairs: [] as string[], // selected pairs
	comparisonMode: false, // choose between funding mode and comparison mode
});

// component with two modes : funding and comparison.
// if in funding mode (no comparison selected), show the funding for each pair and dex
// if in comparison mode (comparison selected), show the difference in funding between the selected dexes for each pair
export default function Funding() {
	const [selected, setSelected] = React.useState<string[]>([]); // horizontal axis
	const [compared, setCompared] = React.useState<string[]>([]); // vertical axis
	const [pairs, setPairs] = React.useState<string[]>([]); // selected pairs
	const [comparisonMode, setComparisonMode] = React.useState<boolean>(false); // choose between funding mode and comparison mode

	React.useEffect(() => {
		setComparisonMode(compared.length > 0 && selected.length > 0);
	}, [compared, selected]);

	React.useEffect(() => {
		if (selected.length === 0) setCompared([]);
	}, [selected]);

	return (
		<div>
			<div className="flex justify-between">
				<div className="flex flex-row items-center gap-1 text-sm">
					<DexesSelector
						selected={selected}
						setSelected={setSelected}
						multiple
						defaultSelected={true}
					/>
					to compare with
					<DexesSelector
						selected={compared}
						setSelected={setCompared}
						multiple
						defaultSelected={false}
						disabled={selected.length === 0}
					/>
					on
					<AssetSelector
						selected={pairs}
						setSelected={setPairs}
						defaultSelected={true}
						disabled={selected.length === 0}
					/>
				</div>
				<h1 className="text-2xl font-bold">{comparisonMode ? "Fundings Comparison" : "Fundings"}</h1>
			</div>

			<FundingContext value={{ selected, compared, pairs, comparisonMode }}>
				<TableFundings />
			</FundingContext>
		</div>
	);
}
