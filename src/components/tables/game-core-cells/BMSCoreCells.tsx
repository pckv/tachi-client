import React from "react";
import { IDStrings, PBScoreDocument, ScoreCalculatedDataLookup, ScoreDocument } from "tachi-common";
import BMSOrPMSLampCell from "../cells/BMSOrPMSLampCell";
import DeltaCell from "../cells/DeltaCell";
import RatingCell from "../cells/RatingCell";
import ScoreCell from "../cells/ScoreCell";

export default function BMSCoreCells({
	sc,
	rating,
}: {
	sc: PBScoreDocument<"bms:7K" | "bms:14K"> | ScoreDocument<"bms:7K" | "bms:14K">;
	rating: ScoreCalculatedDataLookup[IDStrings];
}) {
	return (
		<>
			<ScoreCell score={sc} />
			<DeltaCell
				game="bms"
				playtype={sc.playtype}
				score={sc.scoreData.score}
				percent={sc.scoreData.percent}
				grade={sc.scoreData.grade}
			/>
			<BMSOrPMSLampCell score={sc} />
			<RatingCell score={sc} rating={rating} />
		</>
	);
}
