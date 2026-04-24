"use client";

import React from "react";
import DexesSelector from "@/components/selectors/dexes";
import TableFundings from "./components/table-fundings";
import { AllDexes, DexValues } from "@/lib/funding/dexes/arbies";
import { readStoredDexes, storageKeys } from "../../lib/funding/browserStorage";

export const FundingContext = React.createContext({
	selected: [] as DexValues[], // horizontal axis
	compared: [] as DexValues[], // vertical axis
	comparisonMode: false, // choose between funding mode and comparison mode
});

// component with two modes : funding and comparison.
// if in funding mode (no comparison selected), show the funding for each pair and dex
// if in comparison mode (comparison selected), show the difference in funding between the selected dexes for each pair
export default function Funding() {
	const [selected, setSelected] = React.useState<DexValues[]>(readStoredDexes(storageKeys.selectedDexes, Object.values(AllDexes))); // horizontal axis
	const [compared, setCompared] = React.useState<DexValues[]>(readStoredDexes(storageKeys.comparedDexes, [])); // vertical axis
	const [comparisonMode, setComparisonMode] = React.useState<boolean>(false); // choose between funding mode and comparison mode

	React.useEffect(() => {
		window.localStorage.setItem(storageKeys.selectedDexes, JSON.stringify(selected));
	}, [selected]);

	React.useEffect(() => {
		window.localStorage.setItem(storageKeys.comparedDexes, JSON.stringify(compared));
	}, [compared]);

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
					/>
					to compare with
					<DexesSelector
						selected={compared}
						setSelected={setCompared}
						multiple
						disabled={selected.length === 0}
					/>
				</div>
				<h1 className="text-2xl font-bold">{comparisonMode ? "Fundings Comparison" : "Fundings"}</h1>
			</div>

			<FundingContext value={{ selected, compared, comparisonMode }}>
				<TableFundings />
			</FundingContext>
		</div>
	);
}
