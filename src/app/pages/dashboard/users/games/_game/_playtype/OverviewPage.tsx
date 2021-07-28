import useSetSubheader from "components/layout/header/useSetSubheader";
import Card from "components/layout/page/Card";
import CardHeader from "components/layout/page/CardHeader";
import CardNavButton from "components/layout/page/CardNavButton";
import { UserContext } from "context/UserContext";
import { UserGameStatsContext } from "context/UserGameStatsContext";
import { nanoid } from "nanoid";
import React, { useContext, useMemo, useState } from "react";
import { Button, OverlayTrigger, Tooltip } from "react-bootstrap";
import { Link } from "react-router-dom";
import {
	FormatGame,
	GetGameConfig,
	PublicUserDocument,
	UGPTSettings,
	FormatChart,
	Game,
	AnySongDocument,
	AnyChartDocument,
	FolderDocument,
	GetGamePTConfig,
	UserGameStats,
} from "tachi-common";
import { UGPTHistory, UGPTPreferenceStatsReturn } from "types/api-returns";
import { GamePT } from "types/react";
import { APIFetchV1 } from "util/api";
import AsyncLoader from "components/util/AsyncLoader";
import { Playtype } from "types/tachi";
import TimelineChart from "components/charts/TimelineChart";
import Divider from "components/util/Divider";
import Icon from "components/util/Icon";
import { DateTime } from "luxon";
import { FormatDate, MillisToSince } from "util/time";
import SelectButton from "components/util/SelectButton";
import { UppercaseFirst } from "util/misc";

export default function OverviewPage({
	reqUser,
	game,
	playtype,
	settings,
}: { reqUser: PublicUserDocument; settings: UGPTSettings } & GamePT) {
	const gameConfig = GetGameConfig(game);
	useSetSubheader(
		["Users", reqUser.username, "Games", gameConfig.name, playtype],
		[reqUser, game, playtype],
		`${reqUser.username}'s ${FormatGame(game, playtype)} Overview`
	);

	return (
		<>
			<StatShowcase reqUser={reqUser} game={game} playtype={playtype} />
			<RankingInfo reqUser={reqUser} game={game} playtype={playtype} />
		</>
	);
}

function RankingInfo({ reqUser, game, playtype }: { reqUser: PublicUserDocument } & GamePT) {
	return (
		<AsyncLoader
			promiseFn={async () => {
				const res = await APIFetchV1<UGPTHistory>(
					`/users/${reqUser.id}/games/${game}/${playtype}/history`
				);

				if (!res.success) {
					throw new Error(res.description);
				}

				return res.body;
			}}
		>
			{data => <UserHistory {...{ data, game, playtype, reqUser }} />}
		</AsyncLoader>
	);
}

function UserHistory({
	data,
	reqUser,
	game,
	playtype,
}: { data: UGPTHistory; reqUser: PublicUserDocument } & GamePT) {
	const gptConfig = GetGamePTConfig(game, playtype);

	const [mode, setMode] = useState<"ranking" | "playcount" | "rating">("ranking");
	const [rating, setRating] = useState<keyof UserGameStats["ratings"]>(
		gptConfig.defaultProfileRatingAlg
	);

	const propName = useMemo(() => {
		if (mode === "rating" && rating) {
			return UppercaseFirst(rating);
		}

		return UppercaseFirst(mode);
	}, [mode, rating]);

	const currentPropValue = useMemo(() => {
		if (mode === "rating" && rating) {
			return data[0].ratings[rating] ? data[0].ratings[rating]!.toFixed(2) : "N/A";
		} else if (mode === "ranking") {
			return `#${data[0].ranking}`;
		}

		return data[0].playcount;
	}, [mode, rating]);

	return (
		<Card className="mt-4" header={`${reqUser.username}'s History`}>
			<div className="row d-flex justify-content-center align-items-center mb-4">
				<div className="d-none d-md-block col-md-3 text-center">
					<div className="mb-4">Something</div>
					<div>
						<span className="display-4">Todo</span>
					</div>
				</div>
				<div className="col-12 col-md-6 d-flex justify-content-center">
					<div className="btn-group">
						<SelectButton id="ranking" value={mode} setValue={setMode}>
							<Icon type="trophy" />
							Ranking
						</SelectButton>
						<SelectButton id="playcount" value={mode} setValue={setMode}>
							<Icon type="gamepad" />
							Playcount
						</SelectButton>
						<SelectButton id="rating" value={mode} setValue={setMode}>
							<Icon type="chart-line" />
							Ratings
						</SelectButton>
					</div>
				</div>
				<div className="col-12 d-block d-md-none mb-4"></div>
				<div className="col-12 col-md-3 text-center">
					<div className="mb-4">Current {propName}</div>
					<div>
						<span className="display-4">{currentPropValue}</span>
					</div>
				</div>
			</div>
			<Divider className="mt-6 mb-2" />
			{mode === "ranking" ? (
				<RankingTimeline data={data} />
			) : mode === "playcount" ? (
				<TimelineChart
					height="30rem"
					mobileHeight="20rem"
					data={[
						{
							id: "playcount",
							data: data.map(d => ({ x: d.timestamp, y: d.playcount })),
						},
					]}
					axisBottom={{
						format: x => DateTime.fromJSDate(x).toLocaleString(DateTime.DATE_FULL),
						tickValues: 3,
					}}
					axisLeft={{
						tickSize: 5,
						tickPadding: 5,
						tickRotation: 0,
						format: y => (Number.isInteger(y) ? y : ""),
					}}
					tooltipRenderFn={p => (
						<div>
							{p.data.yFormatted} Play{p.data.yFormatted !== "1" && "s"}
							<br />
							<small className="text-muted">
								{MillisToSince(+p.data.xFormatted)}
							</small>
						</div>
					)}
					curve={"stepAfter"}
					enableArea={true}
					areaBaselineValue={Math.min(...data.map(e => e.playcount))}
				/>
			) : (
				<>
					<div className="col-12 offset-md-4 col-md-4 mt-4">
						<select
							className="form-control"
							value={rating}
							onChange={e =>
								setRating(e.target.value as keyof UserGameStats["ratings"])
							}
						>
							{gptConfig.profileRatingAlgs.map(e => (
								<option key={e} value={e}>
									{UppercaseFirst(e)}
								</option>
							))}
						</select>
					</div>

					<RatingTimeline {...{ data, rating }} />
				</>
			)}
		</Card>
	);
}

function RatingTimeline({
	data,
	rating,
}: {
	data: UGPTHistory;
	rating: keyof UserGameStats["ratings"];
}) {
	const ratingDataset = [
		{ id: rating, data: data.map(e => ({ x: e.timestamp, y: e.ratings[rating] })) },
	];

	return (
		<TimelineChart
			height="30rem"
			mobileHeight="20rem"
			data={ratingDataset}
			axisBottom={{
				format: x => DateTime.fromJSDate(x).toLocaleString(DateTime.DATE_FULL),
				tickValues: 3, // temp
			}}
			axisLeft={{
				tickSize: 5,
				tickPadding: 5,
				tickRotation: 0,
				format: y => (y ? y.toFixed(2) : "N/A"),
			}}
			tooltipRenderFn={p => (
				<div>
					{p.data.y ? (p.data.y as number).toFixed(2) : "N/A"} {UppercaseFirst(rating)}
					<br />
					<small className="text-muted">{MillisToSince(+p.data.xFormatted)}</small>
				</div>
			)}
		/>
	);
}

function RankingTimeline({ data }: { data: UGPTHistory }) {
	return (
		<TimelineChart
			height="30rem"
			mobileHeight="20rem"
			data={[
				{
					id: "ranking",
					data: data.map(d => ({ x: d.timestamp, y: d.ranking })),
				},
			]}
			axisBottom={{
				format: x => DateTime.fromJSDate(x).toLocaleString(DateTime.DATE_FULL),
				tickValues: 3, // temp
			}}
			axisLeft={{
				tickSize: 5,
				tickPadding: 5,
				tickRotation: 0,
				format: y => (Number.isInteger(y) ? `#${y}` : ""),
			}}
			reverse={true}
			tooltipRenderFn={p => (
				<div>
					{MillisToSince(+p.data.xFormatted)}: #{p.data.yFormatted}
					<br />
					<small className="text-muted">({FormatDate(+p.data.xFormatted)})</small>
				</div>
			)}
		/>
	);
}

function StatShowcase({ reqUser, game, playtype }: { reqUser: PublicUserDocument } & GamePT) {
	const { ugs } = useContext(UserGameStatsContext);
	const { user } = useContext(UserContext);

	const [projectingStats, setProjectingStats] = useState(false);

	const hasUserPlayedGame =
		ugs && !!ugs.filter(e => e.game === game && e.playtype === playtype).length;

	const userIsReqUser = user && user.id === reqUser.id;

	const shouldFetchThisUserData = hasUserPlayedGame && !userIsReqUser;

	return (
		<Card
			className="card-dark"
			header={
				<CardHeader
					rightContent={
						userIsReqUser ? (
							<CardNavButton
								type="cog"
								to={`/dashboard/users/${
									user!.username
								}/games/${game}/${playtype}/settings`}
								hoverText="Modify your statistics showcase."
							/>
						) : null
					}
				>
					<h3>
						{projectingStats
							? `${user!.username}'s Stat Showcase (Projected onto ${
									reqUser.username
							  })`
							: `${reqUser.username}'s Stat Showcase`}
					</h3>
				</CardHeader>
			}
			footer={
				<div className="d-flex w-100 justify-content-center">
					<div className="btn-group">
						{hasUserPlayedGame &&
							!userIsReqUser &&
							(projectingStats ? (
								<OverlayTrigger
									placement="top"
									overlay={
										<Tooltip id="quick-panel-tooltip">
											Return to {reqUser.username}&apos;s selected stats.
										</Tooltip>
									}
								>
									<div
										className="btn btn-success"
										onClick={() => setProjectingStats(false)}
									>
										<i className="fas fa-sync" style={{ paddingRight: 0 }} />
									</div>
								</OverlayTrigger>
							) : (
								<OverlayTrigger
									placement="top"
									overlay={
										<Tooltip id={nanoid()}>
											Change the displayed stats to the same ones you use!
										</Tooltip>
									}
								>
									<div
										className="btn btn-outline-secondary"
										onClick={() => setProjectingStats(true)}
									>
										<i className="fas fa-sync" style={{ paddingRight: 0 }} />
									</div>
								</OverlayTrigger>
							))}
						<OverlayTrigger
							placement="top"
							overlay={
								<Tooltip id="quick-panel-tooltip">
									Evaluate a custom statistic.
								</Tooltip>
							}
						>
							<div className="btn btn-outline-secondary">
								<i className="fas fa-file-signature" style={{ paddingRight: 0 }} />
							</div>
						</OverlayTrigger>
					</div>
				</div>
			}
		>
			<AsyncLoader
				promiseFn={async () => {
					const res = await APIFetchV1<UGPTPreferenceStatsReturn[]>(
						`/users/${reqUser.id}/games/${game}/${playtype}/showcase${
							projectingStats ? `?projectUser=${user!.id}` : ""
						}`
					);

					if (!res.success) {
						throw new Error(res.description);
					}

					if (shouldFetchThisUserData) {
						const res2 = await APIFetchV1<UGPTPreferenceStatsReturn[]>(
							`/users/${user!.id}/games/${game}/${playtype}/showcase${
								!projectingStats ? `?projectUser=${reqUser.id}` : ""
							}`
						);

						if (!res2.success) {
							throw new Error(res2.description);
						}

						return { reqUserData: res.body, thisUserData: res2.body };
					}

					return { reqUserData: res.body };
				}}
			>
				{data => (
					<div className="container">
						{data.reqUserData.length === 0 ? (
							<div className="row">
								<div className="col-12 text-center">No stats configured.</div>
								{userIsReqUser && (
									<div className="col-12 mt-2 text-center">
										Why not{" "}
										<Link
											to={`/dashboard/users/${
												user!.username
											}/games/${game}/${playtype}/settings`}
										>
											Set Some?
										</Link>
									</div>
								)}
							</div>
						) : (
							<div className="row justify-content-center">
								{data.reqUserData.map((e, i) => (
									<div
										key={nanoid()}
										className="col-12 col-md-4 d-flex align-items-stretch mt-8"
									>
										<StatDisplay
											statData={e}
											compareData={
												data.thisUserData ? data.thisUserData[i] : undefined
											}
											game={game}
											playtype={playtype}
										/>
									</div>
								))}
							</div>
						)}
					</div>
				)}
			</AsyncLoader>
		</Card>
	);
}

function StatDelta({
	v1,
	v2,
	mode,
	property,
	game,
	playtype,
}: {
	v1: number;
	v2?: number;
	mode: "folder" | "chart";
	property: UGPTPreferenceStatsReturn["stat"]["property"];
	game: Game;
	playtype: Playtype;
}) {
	if (!v2) {
		return null;
	}

	let d: string | number = v2 - v1;
	const formattedV2 = FormatValue(game, playtype, mode, property, v2);
	if (property === "percent") {
		d = `${d.toFixed(2)}%`;
	}

	let colour;
	if (v2 === v1) {
		colour = "warning";
	} else if (v2 > v1) {
		colour = "success";
	} else {
		colour = "danger";
	}

	return (
		<div className={`mt-2 text-${colour}`}>
			<span>
				You: {formattedV2} ({v2 > v1 ? `+${d}` : d})
			</span>
		</div>
	);
}

function FormatValue(
	game: Game,
	playtype: Playtype,
	mode: "folder" | "chart",
	prop: "grade" | "lamp" | "score" | "percent" | "playcount",
	value: number
) {
	if (mode === "folder") {
		return value;
	}

	const gptConfig = GetGamePTConfig(game, playtype);

	if (prop === "percent") {
		return `${value.toFixed(2)}%`;
	} else if (prop === "grade") {
		return gptConfig.grades[value];
	} else if (prop === "lamp") {
		return gptConfig.lamps[value];
	}

	return value;
}

function FormatPropertyGTE(
	game: Game,
	playtype: Playtype,
	prop: "grade" | "lamp" | "score" | "percent" | "playcount",
	gte: number
) {
	const gptConfig = GetGamePTConfig(game, playtype);

	if (prop === "grade") {
		return gptConfig.grades[gte];
	} else if (prop === "lamp") {
		return gptConfig.lamps[gte];
	} else if (prop === "score" || prop === "playcount") {
		return gte;
	}
	// else if (prop === "percent") {
	return gte.toFixed(2);
	// }
}

function StatDisplay({
	statData,
	compareData,
	game,
	playtype,
}: { statData: UGPTPreferenceStatsReturn; compareData?: UGPTPreferenceStatsReturn } & GamePT) {
	const { stat, value, related } = statData;

	if (stat.mode === "chart") {
		const { song, chart } = related as { song: AnySongDocument; chart: AnyChartDocument };

		return (
			<Card
				className="text-center stat-overview-card w-100"
				header={<h5 className="text-muted mb-0">Chart</h5>}
			>
				<>
					<h4>{FormatChart(game, song, chart)}</h4>
					<h4>
						{stat.property[0].toUpperCase() + stat.property.substring(1)}:{" "}
						{value.value
							? stat.property === "percent"
								? `${value.value.toFixed(2)}%`
								: value.value
							: "No Data."}
					</h4>
					<StatDelta
						v1={statData.value.value}
						v2={compareData?.value.value}
						mode={stat.mode}
						property={stat.property}
						game={game}
						playtype={playtype}
					/>
				</>
			</Card>
		);
	} else if (stat.mode === "folder") {
		const { folders } = related as { folders: FolderDocument[] };

		let headerStr;
		if (folders.length === 1) {
			headerStr = folders[0].title;
		} else {
			headerStr = folders.map(e => e.title).join(" and ");
		}

		return (
			<Card
				className="text-center stat-overview-card w-100"
				header={<h5 className="text-muted mb-0">Folder</h5>}
			>
				<>
					<h4>{headerStr}</h4>
					<h5>
						{stat.property[0].toUpperCase() + stat.property.substring(1)} &gt;={" "}
						{FormatPropertyGTE(game, playtype, stat.property, stat.gte)}
					</h5>
					<h4>
						{value.value}
						{/* @ts-expect-error temp */}
						<small className="text-muted">/{value.outOf}</small>
					</h4>

					<StatDelta
						v1={statData.value.value}
						v2={compareData?.value.value}
						mode={stat.mode}
						property={stat.property}
						game={game}
						playtype={playtype}
					/>
				</>
			</Card>
		);
	}

	return <></>;
}
