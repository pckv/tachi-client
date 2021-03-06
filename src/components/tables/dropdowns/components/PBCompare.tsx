import React from "react";
import { ScoreDocument, PBScoreDocument, IDStrings, ChartDocument } from "tachi-common";
import { UGPTChartPBComposition } from "types/api-returns";
import { ScoreState } from "../ScoreDropdown";

export default function PBCompare<I extends IDStrings>({
	data,
	scoreState,
	DocComponent,
}: {
	data: UGPTChartPBComposition<I>;
	scoreState: ScoreState;
	DocComponent: (props: {
		score: ScoreDocument<I> | PBScoreDocument<I>;
		scoreState: ScoreState;
		pbData: UGPTChartPBComposition;
		forceScoreData: boolean;
		chart: ChartDocument<I>;
	}) => JSX.Element;
}) {
	return (
		<DocComponent
			score={data.pb}
			pbData={data}
			scoreState={scoreState}
			forceScoreData
			chart={data.chart}
		/>
	);
}
