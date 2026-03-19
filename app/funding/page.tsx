"use client";

import DexesSelector from "@/components/selectors/dexes";
import AssetSelector from "@/components/selectors/assets";
import { Table, TableCaption, TableHeader, TableRow, TableCell, TableHead, TableBody, } from "@/components/ui/table";
import React from "react";

export default function Funding() {
	const [selected, setSelected] = React.useState<string[]>([]); // horizontal axis
	const [pairs, setPairs] = React.useState<string[]>([]); // selected pairs
	const [compared, setCompared] = React.useState<string[]>([]); // vertical axis

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
						disabled={selected.length === 0 || compared.length === 0}
					/>
				</div>
				<h1 className="text-2xl font-bold">{compared.length > 0 && selected.length > 0 ? "Fundings Comparison" : "Fundings"}</h1>
			</div>
			<Table>
				{selected.length !== 0 && <TableCaption>Click on a cell to view history (WIP)</TableCaption>}

				<TableHeader>
					<TableRow>
						{
							selected.length === 0 ? (
								<TableHead className="flex justify-center">Select a DEX to view history</TableHead>
							) : (
								<>
									<TableHead className="w-25">Asset</TableHead>
									{selected.map((dex) => (
										<TableHead key={dex} className="w-25">{dex}</TableHead>
									))}
								</>
							)
						}
					</TableRow>
				</TableHeader>

				<TableBody>
					{compared.map((dex) => (
						<TableRow>
							<TableCell key={dex} className="h-15">{dex}</TableCell>
						</TableRow>
					))}
				</TableBody>
			</Table>
		</div>
	);
}
