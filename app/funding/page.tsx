"use client";

import DexesSelector from "@/components/selectors/dexes";
import React from "react";

export default function FundingPage() {
	const [selected, setSelected] = React.useState<string[]>([]);

	return (
		<div>
			<DexesSelector selected={selected} setSelected={setSelected} />
		</div>
	);
}
