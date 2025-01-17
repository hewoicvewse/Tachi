import useSetSubheader from "components/layout/header/useSetSubheader";
import Divider from "components/util/Divider";
import Icon from "components/util/Icon";
import SelectLinkButton from "components/util/SelectLinkButton";
import useUGPTBase from "components/util/useUGPTBase";
import React from "react";
import { Col, Row } from "react-bootstrap";
import { Route, Switch } from "react-router-dom";
import { FormatGame, GetGameConfig, PublicUserDocument } from "tachi-common";
import { GamePT } from "types/react";
import GoalsPage from "./GoalsPage";

type Props = { reqUser: PublicUserDocument } & GamePT;

export default function TargetsPage({ reqUser, game, playtype }: Props) {
	const gameConfig = GetGameConfig(game);

	useSetSubheader(
		["Users", reqUser.username, "Games", gameConfig.name, playtype, "Targets"],
		[reqUser, game, playtype],
		`${reqUser.username}'s ${FormatGame(game, playtype)} Targets`
	);

	const base = useUGPTBase({ reqUser, game, playtype });

	return (
		<Row>
			<Col xs={12} className="text-center">
				<div className="btn-group">
					<SelectLinkButton to={`${base}/targets/goals`}>
						<Icon type="bullseye" />
						Goals
					</SelectLinkButton>
					<SelectLinkButton to={`${base}/targets`}>
						<Icon type="chart-line" />
						Overview
					</SelectLinkButton>
					<SelectLinkButton to={`${base}/targets/milestones`}>
						<Icon type="mountain" />
						Milestones
					</SelectLinkButton>
				</div>
				<Divider />
			</Col>
			<Col xs={12}>
				<Switch>
					<Route
						exact
						path="/dashboard/users/:userID/games/:game/:playtype/targets/goals"
					>
						<GoalsPage />
					</Route>
					<Route
						exact
						path="/dashboard/users/:userID/games/:game/:playtype/targets/milestones"
					>
						nal
					</Route>
				</Switch>
			</Col>
		</Row>
	);
}
