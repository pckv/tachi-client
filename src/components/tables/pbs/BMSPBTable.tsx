import React from "react";
import { ChartDocument, PublicUserDocument } from "tachi-common";
import { PBDataset } from "types/tables";
import { BMS_TABLES } from "util/constants/bms-tables";
import { FormatBMSTables, IsNullish } from "util/misc";
import { NumericSOV, StrSOV } from "util/sorts";
import { HumanFriendlyStrToGradeIndex, HumanFriendlyStrToLampIndex } from "util/str-to-num";
import { CreateDefaultPBSearchParams } from "util/tables/create-search";
import { ValueGetterOrHybrid } from "util/ztable/search";
import BMSDifficultyCell from "../cells/BMSDifficultyCell";
import DeltaCell from "../cells/DeltaCell";
import IndexCell from "../cells/IndexCell";
import IndicatorsCell from "../cells/IndicatorsCell";
import LampCell from "../cells/LampCell";
import RankingCell from "../cells/RankingCell";
import ScoreCell from "../cells/ScoreCell";
import TimestampCell from "../cells/TimestampCell";
import TitleCell from "../cells/TitleCell";
import DropdownRow from "../components/DropdownRow";
import TachiTable, { Header } from "../components/TachiTable";
import { usePBState } from "../components/UseScoreState";
import GenericPBDropdown from "../dropdowns/GenericPBDropdown";
import IndicatorHeader from "../headers/IndicatorHeader";

function GetBMSTableVal(chart: ChartDocument<"bms:7K" | "bms:14K">, key: string) {
	for (const table of chart.data.tableFolders) {
		if (table.table === key) {
			return Number(table.level);
		}
	}

	return null;
}

export default function BMSPBTable({
	dataset,
	indexCol = true,
	showPlaycount = false,
	playtype,
}: {
	dataset: PBDataset<"bms:7K" | "bms:14K">;
	indexCol?: boolean;
	showPlaycount?: boolean;
	playtype: "7K" | "14K";
}) {
	const headers: Header<PBDataset<"bms:7K" | "bms:14K">[0]>[] = [
		[
			"Chart",
			"Chart",
			NumericSOV(
				x =>
					x.__related.chart.tierlistInfo["sgl-EC"]?.value ??
					x.__related.chart.tierlistInfo["sgl-HC"]?.value ??
					x.__related.chart.levelNum
			),
		],
		IndicatorHeader,
		["Song", "Song", StrSOV(x => x.__related.song.title)],
		["Score", "Score", NumericSOV(x => x.scoreData.percent)],
		["Deltas", "Deltas", NumericSOV(x => x.scoreData.percent)],
		["Lamp", "Lamp", NumericSOV(x => x.scoreData.lampIndex)],
		["Sieglinde", "sgl.", NumericSOV(x => x.calculatedData.sieglinde ?? 0)],
		["Site Ranking", "Site Rank", NumericSOV(x => x.rankingData.rank)],
		["Last Raised", "Last Raised", NumericSOV(x => x.timeAchieved ?? 0)],
	];

	if (showPlaycount) {
		headers.push(["Playcount", "Plays", NumericSOV(x => x.__playcount ?? 0)]);
	}

	if (indexCol) {
		headers.unshift(["#", "#", NumericSOV(x => x.__related.index)]);
	}

	let tableSearchFns: Record<
		string,
		ValueGetterOrHybrid<PBDataset<"bms:7K" | "bms:14K">[0]>
	> = {};
	if (playtype === "7K") {
		tableSearchFns = {
			insane: x => GetBMSTableVal(x.__related.chart, BMS_TABLES.insane),
			overjoy: x => GetBMSTableVal(x.__related.chart, BMS_TABLES.overjoy),
			insane2: x => GetBMSTableVal(x.__related.chart, BMS_TABLES.insane2),
			normal: x => GetBMSTableVal(x.__related.chart, BMS_TABLES.normal),
			normal2: x => GetBMSTableVal(x.__related.chart, BMS_TABLES.normal2),
			st: x => GetBMSTableVal(x.__related.chart, BMS_TABLES.stella),
			sl: x => GetBMSTableVal(x.__related.chart, BMS_TABLES.satellite),
			satellite: x => GetBMSTableVal(x.__related.chart, BMS_TABLES.satellite),
			stella: x => GetBMSTableVal(x.__related.chart, BMS_TABLES.stella),
		};
	} else {
		tableSearchFns = {
			insane: x => GetBMSTableVal(x.__related.chart, BMS_TABLES.dpInsane),
			normal: x => GetBMSTableVal(x.__related.chart, BMS_TABLES.dpNormal),
			sl: x => GetBMSTableVal(x.__related.chart, BMS_TABLES.satellite),
			satellite: x => GetBMSTableVal(x.__related.chart, BMS_TABLES.satellite),
		};
	}

	return (
		<TachiTable
			dataset={dataset}
			headers={headers}
			entryName="PBs"
			searchFunctions={CreateDefaultPBSearchParams("bms", playtype)}
			defaultSortMode={indexCol ? "#" : undefined}
			rowFunction={pb => (
				<Row
					pb={pb}
					key={`${pb.chartID}:${pb.userID}`}
					showPlaycount={showPlaycount}
					indexCol={indexCol}
				/>
			)}
		/>
	);
}

function Row({
	pb,
	indexCol,
	showPlaycount,
}: {
	pb: PBDataset<"bms:7K" | "bms:14K">[0];
	indexCol: boolean;
	showPlaycount: boolean;
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
			<BMSDifficultyCell chart={pb.__related.chart} />
			<IndicatorsCell highlight={scoreState.highlight} />
			<TitleCell song={pb.__related.song} chart={pb.__related.chart} game="bms" />
			<ScoreCell score={pb} />
			<DeltaCell
				game="bms"
				playtype={pb.playtype}
				score={pb.scoreData.score}
				percent={pb.scoreData.percent}
				grade={pb.scoreData.grade}
			/>
			<LampCell score={pb} />
			<td>
				{!IsNullish(pb.calculatedData.sieglinde)
					? pb.calculatedData.sieglinde!.toFixed(2)
					: "N/A"}
			</td>
			<RankingCell rankingData={pb.rankingData} />
			<TimestampCell time={pb.timeAchieved} />
			{showPlaycount && <td>{pb.__playcount ?? 0}</td>}
		</DropdownRow>
	);
}
