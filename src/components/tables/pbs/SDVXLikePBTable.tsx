import React from "react";
import { PBDataset } from "types/tables";
import { IsNullish } from "util/misc";
import { NumericSOV } from "util/sorts";
import { CreateDefaultPBSearchParams } from "util/tables/create-search";
import { GetPBLeadingHeaders } from "util/tables/get-pb-leaders";
import IndexCell from "../cells/IndexCell";
import LampCell from "../cells/LampCell";
import MillionsScoreCell from "../cells/MillionsScoreCell";
import RankingCell from "../cells/RankingCell";
import SDVXJudgementCell from "../cells/SDVXJudgementCell";
import TimestampCell from "../cells/TimestampCell";
import DropdownRow from "../components/DropdownRow";
import TachiTable, { Header } from "../components/TachiTable";
import { usePBState } from "../components/UseScoreState";
import GenericPBDropdown from "../dropdowns/GenericPBDropdown";
import PBLeadingRows from "./PBLeadingRows";

export default function SDVXLikePBTable({
	game,
	dataset,
	indexCol = true,
	showPlaycount = false,
	playtype,
	showUser = false,
	showChart = true,
}: {
	game: "sdvx" | "usc";
	dataset: PBDataset<"sdvx:Single">;
	indexCol?: boolean;
	showPlaycount?: boolean;
	playtype: "7K" | "14K";
	showUser?: boolean;
	showChart?: boolean;
}) {
	const headers: Header<PBDataset<"sdvx:Single">[0]>[] = [
		...GetPBLeadingHeaders(showUser, showChart, [
			"Chart",
			"Chart",
			NumericSOV(x => x.__related.chart.levelNum),
		]),
		["Score", "Score", NumericSOV(x => x.scoreData.percent)],
		["Near - Miss", "Nr. Ms.", NumericSOV(x => x.scoreData.percent)],
		["Lamp", "Lamp", NumericSOV(x => x.scoreData.lampIndex)],
		["VF6", "VF6", NumericSOV(x => x.calculatedData.VF6 ?? 0)],
		["Site Ranking", "Site Rank", NumericSOV(x => x.rankingData.rank)],
		["Last Raised", "Last Raised", NumericSOV(x => x.timeAchieved ?? 0)],
	];

	if (showPlaycount) {
		headers.push(["Playcount", "Plays", NumericSOV(x => x.__playcount ?? 0)]);
	}

	if (indexCol) {
		headers.unshift(["#", "#", NumericSOV(x => x.__related.index)]);
	}

	return (
		<TachiTable
			dataset={dataset}
			headers={headers}
			entryName="PBs"
			searchFunctions={CreateDefaultPBSearchParams(game, playtype)}
			defaultSortMode={indexCol ? "#" : undefined}
			rowFunction={pb => (
				<Row
					pb={pb}
					key={`${pb.chartID}:${pb.userID}`}
					indexCol={indexCol}
					showPlaycount={showPlaycount}
					showChart={showChart}
					showUser={showUser}
				/>
			)}
		/>
	);
}

function Row({
	pb,
	indexCol,
	showPlaycount,
	showChart,
	showUser,
}: {
	pb: PBDataset<"sdvx:Single">[0];
	indexCol: boolean;
	showPlaycount: boolean;
	showChart: boolean;
	showUser: boolean;
}) {
	const scoreState = usePBState(pb);

	return (
		<DropdownRow
			dropdown={
				<GenericPBDropdown
					chart={pb.__related.chart}
					userID={pb.userID}
					game={pb.game}
					playtype={pb.playtype}
					scoreState={scoreState}
				/>
			}
		>
			{indexCol && <IndexCell index={pb.__related.index} />}
			<PBLeadingRows {...{ showUser, showChart, pb, scoreState }} />
			<MillionsScoreCell score={pb} />
			<SDVXJudgementCell score={pb} />
			<LampCell score={pb} />
			<td>
				{!IsNullish(pb.calculatedData.VF6) ? pb.calculatedData.VF6!.toFixed(3) : "No Data."}
			</td>
			<RankingCell rankingData={pb.rankingData} />
			<TimestampCell time={pb.timeAchieved} />
			{showPlaycount && <td>{pb.__playcount ?? 0}</td>}
		</DropdownRow>
	);
}