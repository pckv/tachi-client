import React, { useEffect, useRef, useState } from "react";
import { SongDocument, Game, GetGameConfig, integer, PublicUserDocument } from "tachi-common";
import { APIFetchV1 } from "util/api";
import { toAbsoluteUrl } from "_metronic/_helpers";
import { JustChildren } from "types/react";
import { Link } from "react-router-dom";
import Divider from "components/util/Divider";
import { NO_OP, PREVENT_DEFAULT } from "util/misc";
import Loading from "components/util/Loading";

interface SearchReturns {
	users: PublicUserDocument[];
	songs: (SongDocument & { __textScore: number; game: Game })[];
}

function SearchResult({
	children,
	link,
	tabIndex,
}: JustChildren & { link: string; tabIndex?: integer }) {
	return (
		<Link
			className="d-flex align-items-center flex-grow-1 mb-2 search-result"
			tabIndex={tabIndex}
			to={link}
		>
			<div className="d-flex flex-column ml-3 mt-2 mb-2">{children}</div>
		</Link>
	);
}

function SearchResults({ results }: { results: SearchReturns }) {
	if (!results.users.length && !results.songs.length) {
		return (
			<div className="font-size-sm font-weight-bolder text-uppercase mb-2 text-center">
				Found nothing :(
			</div>
		);
	}

	return (
		<div className="quick-search-result">
			{results?.users.length ? (
				<>
					<div className="font-size-sm text-primary font-weight-bolder text-uppercase mb-2">
						Users
					</div>
					<div>
						{results.users.map(u => (
							<SearchResult
								key={u.id}
								link={`/dashboard/users/${u.username}`}
								tabIndex={0}
							>
								<strong>{u.username}</strong>
								<span className="font-size-sm font-weight-bold text-muted">
									{u.about.length >= 50
										? `${u.about.substring(0, 47)}...`
										: u.about}
								</span>
							</SearchResult>
						))}
					</div>
					<Divider className="mt-2 mb-4" />
				</>
			) : (
				<></>
			)}
			{results?.songs.length ? (
				<>
					<div className="font-size-sm text-primary font-weight-bolder text-uppercase mb-2">
						Songs
					</div>
					<div className="mb-4">
						{results.songs.map(s => (
							<SearchResult
								key={s.id + s.game}
								link={`/dashboard/games/${s.game}/${
									GetGameConfig(s.game).defaultPlaytype
								}/songs/${s.id}`}
								tabIndex={0}
							>
								<strong>{s.title}</strong>
								<span className="font-size-sm font-weight-bold text-muted">
									{GetGameConfig(s.game).name}
								</span>
							</SearchResult>
						))}
					</div>
				</>
			) : (
				<></>
			)}
		</div>
	);
}

export default function SearchBar() {
	const [show, setShow] = useState(false);
	const [search, setSearch] = useState("");
	const [results, setResults] = useState<SearchReturns | null>(null);
	const [lastTimeout, setLastTimeout] = useState<number | null>(null);

	const ref = useRef(null);
	const inputRef = useRef(null);

	// onclick outside
	useEffect(() => {
		function clickOutside(event: MouseEvent) {
			// @ts-expect-error lazy
			if (ref.current && !ref.current.contains(event.target)) {
				setShow(false);
			}
		}

		document.addEventListener("mousedown", clickOutside);
		return () => {
			document.removeEventListener("mousedown", clickOutside);
		};
	}, [ref]);

	useEffect(() => {
		setShow(search !== "");
	}, [search]);

	// debouncer result-getter
	function UpdateSearch(event: React.ChangeEvent<HTMLInputElement>) {
		setSearch(event.target.value);

		if (lastTimeout !== null) {
			clearTimeout(lastTimeout);
		}

		const closureSearch = event.target.value;

		// compatibility note - we use window here to specify to typescript
		// that this is NOT the node version of setTimeout() (which does not return a number).
		const handle = window.setTimeout(() => {
			APIFetchV1<SearchReturns>(`/search?search=${encodeURIComponent(closureSearch)}`).then(
				r => {
					if (r.success === false) {
						console.error(r);
						return;
					}

					setResults(r.body);
				}
			);
		}, 250);

		setLastTimeout(handle);
	}

	return (
		<div ref={ref} className="align-self-center">
			<div className="topbar-item mr-2">
				<form className="quick-search-form" onSubmit={PREVENT_DEFAULT}>
					<div className="input-group">
						<input
							className="form-control"
							type="text"
							ref={inputRef}
							value={search}
							onChange={UpdateSearch}
							onClick={() => {
								if (search !== "") {
									setShow(true);
								}
							}}
							placeholder="Search users, songs, charts..."
						/>
					</div>
				</form>
			</div>
			<div style={{ position: "relative", top: "20px" }}>
				<div
					className={`dropdown-menu p-0 m-0 dropdown-menu-right dropdown-menu-anim-up dropdown-menu-lg dropdown-menu dropdown-menu-right ${
						show ? "show" : "hide"
					}`}
					style={{
						position: "absolute",
						borderRadius: "0 0 5px 5px",
					}}
				>
					<div
						id="kt_quick_search_dropdown"
						className="quick-search quick-search-dropdown quick-search-has-result"
					>
						<div
							style={{ maxHeight: "325px", overflowY: "scroll" }}
							className="quick-search-wrapper"
						>
							{results ? <SearchResults results={results} /> : <Loading />}
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
