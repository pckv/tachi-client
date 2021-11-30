import React from "react";
import { integer, Playtypes, PublicUserDocument } from "tachi-common";
import { ScoreDataset } from "types/tables";
import { NumericSOV, StrSOV } from "util/sorts";
import { CreateDefaultScoreSearchParams } from "util/tables/create-search";
import DifficultyCell from "../cells/DifficultyCell";
import IndicatorsCell from "../cells/IndicatorsCell";
import TimestampCell from "../cells/TimestampCell";
import TitleCell from "../cells/TitleCell";
import UserCell from "../cells/UserCell";
import DropdownRow from "../components/DropdownRow";
import TachiTable, { Header } from "../components/TachiTable";
import { useScoreState } from "../components/UseScoreState";
import GenericScoreDropdown from "../dropdowns/GenericScoreDropdown";
import SDVXScoreCoreCells from "../game-core-cells/SDVXCoreCells";
import IndicatorHeader from "../headers/IndicatorHeader";

export default function SDVXLikeScoreTable({
	reqUser,
	dataset,
	pageLen,
	userCol = false,
	game,
	playtype,
}: {
	reqUser: PublicUserDocument;
	dataset: ScoreDataset<"sdvx:Single">;
	pageLen?: integer;
	playtype: Playtypes["sdvx" | "usc"];
	game: "sdvx" | "usc";
	userCol?: boolean;
}) {
	const headers: Header<ScoreDataset<"sdvx:Single">[0]>[] = [
		["Chart", "Chart", NumericSOV(x => x.__related.chart.levelNum)],
		IndicatorHeader,
		["Song", "Song", StrSOV(x => x.__related.song.title)],
		["Score", "Score", NumericSOV(x => x.scoreData.percent)],
		["Near - Miss", "Nr. Ms.", NumericSOV(x => x.scoreData.percent)],
		["Lamp", "Lamp", NumericSOV(x => x.scoreData.lampIndex)],
		["VF6", "VF6", NumericSOV(x => x.calculatedData.VF6 ?? 0)],

		["Timestamp", "Timestamp", NumericSOV(x => x.timeAchieved ?? 0)],
	];

	if (userCol) {
		headers.unshift(["User", "User", StrSOV(x => x.__related.user.username)]);
	}

	return (
		<TachiTable
			dataset={dataset}
			pageLen={pageLen}
			headers={headers}
			entryName="Scores"
			searchFunctions={CreateDefaultScoreSearchParams(game, playtype)}
			rowFunction={sc => (
				<Row key={sc.scoreID} sc={sc} reqUser={reqUser} userCol={userCol} game={game} />
			)}
		/>
	);
}

function Row({
	sc,
	reqUser,
	userCol,
	game,
}: {
	sc: ScoreDataset<"sdvx:Single">[0];
	reqUser: PublicUserDocument;
	userCol: boolean;
	game: "sdvx" | "usc";
}) {
	const scoreState = useScoreState(sc);

	return (
		<DropdownRow
			dropdown={
				<GenericScoreDropdown
					chart={sc.__related.chart}
					user={sc.__related.user}
					game={sc.game}
					thisScore={sc}
					playtype={sc.playtype}
					scoreState={scoreState}
				/>
			}
		>
			{userCol && <UserCell game={sc.game} playtype={sc.playtype} user={sc.__related.user} />}
			<DifficultyCell chart={sc.__related.chart} game={game} />
			<IndicatorsCell highlight={scoreState.highlight} />
			<TitleCell
				song={sc.__related.song}
				comment={sc.comment}
				chart={sc.__related.chart}
				game={game}
			/>
			<SDVXScoreCoreCells sc={sc} />
			<TimestampCell time={sc.timeAchieved} service={sc.service} />
		</DropdownRow>
	);
}