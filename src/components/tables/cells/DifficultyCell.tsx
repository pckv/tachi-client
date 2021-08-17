import QuickTooltip from "components/layout/misc/QuickTooltip";
import Icon from "components/util/Icon";
import React from "react";
import {
	ChartDocument,
	FormatDifficulty,
	FormatDifficultyShort,
	Game,
	GetGamePTConfig,
} from "tachi-common";
import { ChangeOpacity } from "util/color-opacity";

export default function DifficultyCell({
	game,
	chart,
	alwaysShort,
}: {
	game: Game;
	chart: ChartDocument;
	alwaysShort?: boolean;
}) {
	const gptConfig = GetGamePTConfig(game, chart.playtype);

	return (
		<td
			style={{
				backgroundColor: ChangeOpacity(gptConfig.difficultyColours[chart.difficulty]!, 0.2),
			}}
		>
			{!alwaysShort && (
				<span className="d-none d-lg-block">{FormatDifficulty(chart, game)}</span>
			)}
			<span className={!alwaysShort ? "d-lg-none" : ""}>
				{FormatDifficultyShort(chart, game)}
			</span>
			{!chart.isPrimary && (
				<QuickTooltip text="This chart is an alternate, old chart.">
					<div>
						<Icon type="exclamation-triangle" />
					</div>
				</QuickTooltip>
			)}
		</td>
	);
}
