import HistoryScoreTable from "components/tables/history-scores/HistoryScoreTable";
import Loading from "components/util/Loading";
import React from "react";
import { ChartDocument, ScoreDocument } from "tachi-common";
import { GamePT } from "types/react";
import { UnsuccessfulAPIFetchResponse } from "util/api";

export default function PlayHistory({
	data,
	isLoading,
	error,
	game,
	playtype,
	chart,
}: {
	data?: ScoreDocument[];
	isLoading: boolean;
	error: UnsuccessfulAPIFetchResponse | null;
	chart: ChartDocument;
} & GamePT) {
	if (error) {
		return <>{error.description}</>;
	}

	if (isLoading || !data) {
		return <Loading />;
	}

	return (
		<div className="col-12 col-lg-10">
			<HistoryScoreTable dataset={data} game={game} playtype={playtype} chart={chart} />
		</div>
	);
}
