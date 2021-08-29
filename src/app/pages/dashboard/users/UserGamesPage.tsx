import React, { useContext, useState, useMemo, useEffect } from "react";
import { FormatGame, PublicUserDocument, UserGameStats } from "tachi-common";
import useSetSubheader from "components/layout/header/useSetSubheader";
import Card from "components/layout/page/Card";
import ReactMarkdown from "react-markdown";
import { UserContext } from "context/UserContext";
import { Button } from "react-bootstrap";
import { APIFetchV1 } from "util/api";
import Divider from "components/util/Divider";
import Muted from "components/util/Muted";
import ExternalLink from "components/util/ExternalLink";
import AsyncLoader from "components/util/AsyncLoader";
import UGPTRatingsTable from "components/user/UGPTStatsOverview";
import LinkButton from "components/util/LinkButton";
import { UGSWithRankingData } from "types/api-returns";
import RankingData from "components/user/UGPTRankingData";

interface Props {
	reqUser: PublicUserDocument;
}

export default function UserGamesPage({ reqUser }: Props) {
	useSetSubheader(["Users", reqUser.username], [reqUser], `${reqUser.username}'s Profile`);

	return (
		<div className="row">
			<AsyncLoader
				promiseFn={async () => {
					const res = await APIFetchV1<UGSWithRankingData[]>(
						`/users/${reqUser.id}/game-stats`
					);

					if (!res.success) {
						throw new Error(res.description);
					}

					return res.body;
				}}
			>
				{ugs =>
					ugs.map((e, i) => {
						// uses modulo to determine whether we're on the
						// last row or not
						// to do sizing like [12] or [6][6] instead of [3][3][3]
						let mdSize = "6";
						let lgSize = "4";
						if (ugs.length - i <= ugs.length % 3) {
							lgSize = (12 / (ugs.length % 3)).toString();
						}

						if (ugs.length - i <= ugs.length % 2) {
							mdSize = (12 / (ugs.length % 2)).toString();
						}

						return (
							<div
								className={`col-12 col-md-${mdSize} col-lg-${lgSize}`}
								key={`${e.game}:${e.playtype}`}
							>
								<GameStatContainer ugs={e} reqUser={reqUser} />
							</div>
						);
					})
				}
			</AsyncLoader>
		</div>
	);
}

function GameStatContainer({ ugs, reqUser }: { ugs: UGSWithRankingData } & Props) {
	return (
		<Card
			className="mb-4"
			footer={
				<div className="d-flex justify-content-end">
					<LinkButton
						to={`/dashboard/users/${reqUser.username}/games/${ugs.game}/${ugs.playtype}`}
					>
						View Game Profile
					</LinkButton>
				</div>
			}
			header={FormatGame(ugs.game, ugs.playtype)}
		>
			<UGPTRatingsTable ugs={ugs} />
			<RankingData ranking={ugs.__rankingData.ranking} outOf={ugs.__rankingData.outOf} />
		</Card>
	);
}