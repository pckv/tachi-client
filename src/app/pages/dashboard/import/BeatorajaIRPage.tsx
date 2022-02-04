import useSetSubheader from "components/layout/header/useSetSubheader";
import Divider from "components/util/Divider";
import ExternalLink from "components/util/ExternalLink";
import Muted from "components/util/Muted";
import { TachiConfig } from "lib/config";
import React from "react";

const WIN_BAT = `
REM *** Set system-wide "_JAVA_OPTIONS" environment variable to use OpenGL pipeline (improved performance of > 30% potentially. Also use anti-aliasing for non-LR2 fonts, and finally allow Swing framework to utilize AA and GTKLookAndFeel for config window. ***
set _JAVA_OPTIONS='-Dsun.java2d.opengl=true -Dawt.useSystemAAFontSettings=on -Dswing.aatext=true -Dswing.defaultlaf=com.sun.java.swing.plaf.gtk.GTKLookAndFeel' -Dfile.encoding="UTF-8"
pushd %~dp0
java -Xms1g -Xmx4g -cp beatoraja.jar;ir/* bms.player.beatoraja.MainLoader
popd
`;

const LINUX_SH = `
#!/bin/bash
export _JAVA_OPTIONS='-Dsun.java2d.opengl=true -Dawt.useSystemAAFontSettings=on -Dswing.aatext=true -Dswing.defaultlaf=com.sun.java.swing.plaf.gtk.GTKLookAndFeel -Dfile.encoding="UTF-8"'
java -Xms1g -Xmx4g -cp 'beatoraja.jar;ir/*' bms.player.beatoraja.MainLoader
`;

export default function BeatorajaIRPage() {
	useSetSubheader(["Import Scores", "Beatoraja IR"]);

	return (
		<div>
			<h2 className="text-center mb-4">Beatoraja IR Setup Instructions</h2>
			<ol className="instructions-list">
				<li>
					Download the latest version of the Beatoraja IR{" "}
					<ExternalLink href="https://github.com/TNG-dev/tachi-beatoraja-ir/releases">
						here
					</ExternalLink>
					.
				</li>
				<li>
					Make sure you're running <b>LR2oraja</b>. {TachiConfig.name} does <b>NOT</b>{" "}
					support beatoraja, and will not accept scores from the client.
					<br />
					<ExternalLink href="https://github.com/wcko87/lr2oraja/releases">
						LR2oraja
					</ExternalLink>{" "}
					is a one-file change for beatoraja that changes the settings to match LR2, which
					is the standard for players.
					<br />
					Beatoraja has significantly different gauge implementations, which means
					cross-comparing scores is unfair.
				</li>
				<li>
					Place the IR <code>.jar</code> file in the <code>ir/</code> folder.
				</li>
				<li>Open the game options, and navigate to the IR section.</li>
				<li>
					Select {TachiConfig.name} IR.
					<br />
					<span className="text-warning">
						If the IR isn't showing up, make sure you're launching the game with the{" "}
						<code>beatoraja-config.bat</code> file. Otherwise, IRs will never load.
						<br />
						If this is still not working, you may not have a{" "}
						<code>beatoraja-config.bat</code> file that supports custom IRs. Here are
						working ones.
						<ul>
							<li>
								<a
									download="beatoraja-config.bat"
									href={`data:text/plain;base64,${window.btoa(WIN_BAT)}`}
								>
									Windows
								</a>
							</li>
							<li>
								<a
									download="beatoraja-config.sh"
									href={`data:text/plain;base64,${window.btoa(LINUX_SH)}`}
								>
									Linux
								</a>
							</li>
						</ul>
					</span>
				</li>
				<li>
					Get an API token for the IR by clicking{" "}
					<ExternalLink href="/client-file-flow/CXBeatorajaIR">this link</ExternalLink>.
				</li>
				<li>
					Place the API token in the password field. Put your username in as well! The IR
					wont load if you don't have a username set.
					<br />
					<span className="text-warning">
						<b>DO NOT PUT YOUR PASSWORD IN THE PASSWORD FIELD!</b>
						<br />
						For security reasons, you must put the API Key in that field, instead.
					</span>
				</li>
				<li>
					That's it! Launch the game and start playing, your scores will automatically
					submit to the server.
				</li>
			</ol>
			<Divider />
			<Muted>
				Note: If you submit a score on a chart that {TachiConfig.name} doesn't recognise,
				you'll need to wait until atleast 2 other players submit scores for that chart
				before it'll show up. This is to combat accidental IR spam.
			</Muted>
		</div>
	);
}
