import React from "react";
import {
	ChartDocument,
	Game,
	IDStrings,
	PBScoreDocument,
	ScoreCalculatedDataLookup,
	ScoreDocument,
} from "tachi-common";
import BMSCoreCells from "./BMSCoreCells";
import CHUNITHMCoreCells from "./CHUNITHMCoreCells";
import GenericCoreCells from "./GenericCoreCells";
import IIDXCoreCells from "./IIDXCoreCells";
import JubeatCoreCells from "./JubeatCoreCells";
import MusecaCoreCells from "./MusecaCoreCells";
import PMSCoreCells from "./PMSCoreCells";
import PopnCoreCells from "./PopnCoreCells";
import SDVXScoreCoreCells from "./SDVXCoreCells";
import WACCACoreCells from "./WACCACoreCells";

export default function ScoreCoreCells({
	game,
	score,
	rating,
	chart,
}: {
	score: ScoreDocument | PBScoreDocument;
	chart: ChartDocument;
	rating: ScoreCalculatedDataLookup[IDStrings];
	game: Game;
}) {
	const sc = score as any; // lazy hack

	if (game === "iidx") {
		return (
			<IIDXCoreCells
				rating={rating as ScoreCalculatedDataLookup["iidx:SP" | "iidx:DP"]}
				chart={chart as ChartDocument<"iidx:SP" | "iidx:DP">}
				sc={sc}
			/>
		);
	} else if (game === "bms") {
		return <BMSCoreCells sc={sc} rating={rating} />;
	} else if (game === "sdvx" || game === "usc") {
		return (
			<SDVXScoreCoreCells
				sc={sc}
				chart={chart as ChartDocument<"sdvx:Single" | "usc:Controller" | "usc:Keyboard">}
			/>
		);
	} else if (game === "maimai") {
		return <GenericCoreCells showScore={false} sc={sc} rating={rating} />;
	} else if (game === "museca") {
		return <MusecaCoreCells sc={sc} rating={rating} />;
	} else if (game === "wacca") {
		return <WACCACoreCells sc={sc} rating={rating} />;
	} else if (game === "popn") {
		return <PopnCoreCells sc={sc} rating={rating} />;
	} else if (game === "jubeat") {
		return <JubeatCoreCells sc={sc} rating={rating} />;
	} else if (game === "chunithm") {
		return <CHUNITHMCoreCells sc={sc} rating={rating} />;
	} else if (game === "ddr") {
		return <GenericCoreCells sc={sc} rating={rating} />;
	} else if (game === "gitadora") {
		return <GenericCoreCells sc={sc} rating={rating} />;
	} else if (game === "pms") {
		return <PMSCoreCells sc={sc} rating={rating} />;
	}

	return <GenericCoreCells sc={sc} rating={rating} />;
}
