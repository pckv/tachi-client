import useSetSubheader from "components/layout/header/useSetSubheader";
import Icon from "components/util/Icon";
import SelectLinkButton from "components/util/SelectLinkButton";
import useUGPTBase from "components/util/useUGPTBase";
import React from "react";
import { Route, Switch } from "react-router-dom";
import { FormatGame, GetGameConfig, PublicUserDocument } from "tachi-common";
import { GamePT } from "types/react";
import FolderSelectPage from "./FolderSelectPage";
import FolderTablePage from "./FolderTablePage";

type Props = { reqUser: PublicUserDocument } & GamePT;

export default function FoldersMainPage({ reqUser, game, playtype }: Props) {
	const gameConfig = GetGameConfig(game);

	useSetSubheader(
		["Users", reqUser.username, "Games", gameConfig.name, playtype, "Folders"],
		[reqUser, game, playtype],
		`${reqUser.username}'s ${FormatGame(game, playtype)} Folders`
	);

	const base = useUGPTBase({ reqUser, game, playtype });

	return (
		<div className="row">
			<div className="col-12 text-center">
				<div className="btn-group mb-4">
					<SelectLinkButton to={`${base}/folders`}>
						<Icon type="table" />
						Table View
					</SelectLinkButton>
					<SelectLinkButton to={`${base}/folders/search`}>
						<Icon type="search" />
						Folder Select
					</SelectLinkButton>
				</div>
			</div>
			<div className="col-12">
				<Switch>
					<Route exact path="/dashboard/users/:userID/games/:game/:playtype/folders">
						<FolderTablePage {...{ reqUser, game, playtype }} />
					</Route>
					<Route
						exact
						path="/dashboard/users/:userID/games/:game/:playtype/folders/search"
					>
						<FolderSelectPage {...{ reqUser, game, playtype }} />
					</Route>
				</Switch>
			</div>
		</div>
	);
}
