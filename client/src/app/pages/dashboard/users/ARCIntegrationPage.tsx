import { APIFetchV1 } from "util/api";
import ApiError from "components/util/ApiError";
import Divider from "components/util/Divider";
import Loading from "components/util/Loading";
import Muted from "components/util/Muted";
import useApiQuery from "components/util/query/useApiQuery";
import React, { useEffect, useState } from "react";
import { Button, Col, Form } from "react-bootstrap";
import { Link } from "react-router-dom";
import { ARCSavedProfileDocument, PublicUserDocument } from "tachi-common";
import { SetState } from "types/react";

export default function ARCIntegrationPage({ reqUser }: { reqUser: PublicUserDocument }) {
	const [iidxID, setIIDXID] = useState("");
	const [sdvxID, setSDVXID] = useState("");

	const { data, error } = useApiQuery<{
		iidx: ARCSavedProfileDocument | null;
		sdvx: ARCSavedProfileDocument | null;
	}>(`/users/${reqUser.id}/integrations/arc`, undefined, true);

	useEffect(() => {
		if (data) {
			setIIDXID(data.iidx?.accountID ?? "");
			setSDVXID(data.sdvx?.accountID ?? "");
		}
	}, [data]);

	if (error) {
		return <ApiError error={error} />;
	}

	if (!data) {
		return <Loading />;
	}

	return (
		<>
			<Col xs={12}>
				<h4>ARC Integration</h4>
				<span>To import scores from ARC, just put your AccountIDs in the tabs below.</span>
				<br />
				<Muted>
					Note: Only the latest versions of IIDX and SDVX are supported for imports.
				</Muted>
				<Divider />
				<h5>How to get your AccountID</h5>
				<ol className="text-left">
					<li>Open the ARC website.</li>
					<li>Go to the game you care about, and select My Bests.</li>
					<li>
						In the URL, after <code>/profiles</code>, there'll be a string that looks
						like <code>H4JxPV3vQH_</code>. Copy that into the text fields below!
					</li>
					<li>To unset an integration, remove the account ID and hit save.</li>
				</ol>
			</Col>
			<Col xs={12} className="mt-4">
				<IntegrationStatus name="IIDX" value={iidxID} setValue={setIIDXID} />
				<span className="text-warning">
					This profile <b>MUST</b> be for BISTROVER! You need to have atleast one play on
					BISTROVER for your scores to carry over.
				</span>
				<br />
				{iidxID && iidxID.length !== 11 && (
					<span className="text-danger">
						Invalid IIDX ID, it should be 11 characters long.
					</span>
				)}
				<IntegrationStatus name="SDVX" value={sdvxID} setValue={setSDVXID} />
				<span className="text-warning">
					This profile <b>MUST</b> be for VIVID WAVE! You need to have atleast one play on
					VIVID WAVE for your scores to carry over.
				</span>
				<br />
				{sdvxID && sdvxID.length !== 11 && (
					<span className="text-danger">
						Invalid SDVX ID, it should be 11 characters long.
					</span>
				)}
				<Divider />
				<Button
					disabled={
						!!(iidxID && iidxID.length !== 11) || !!(sdvxID && sdvxID.length !== 11)
					}
					onClick={() => {
						APIFetchV1(
							`/users/${reqUser.id}/integrations/arc`,
							{
								method: "PATCH",
								headers: {
									"Content-Type": "application/json",
								},
								body: JSON.stringify({
									iidx: iidxID || null,
									sdvx: sdvxID || null,
								}),
							},
							true,
							true
						);
					}}
				>
					Submit Settings
				</Button>
				<Divider />
				After setting this, go to <Link to="/dashboard/import">Import Scores</Link>!
			</Col>
		</>
	);
}

function IntegrationStatus({
	name,
	value,
	setValue,
}: {
	name: string;
	value: string;
	setValue: SetState<string>;
}) {
	return (
		<Form.Group className="mt-4">
			<Form.Label>{`${name} Account ID`}</Form.Label>
			<Form.Control
				type="text"
				value={value}
				placeholder="H4JxPV3vQH_"
				onChange={(e) => setValue(e.target.value)}
			/>
		</Form.Group>
	);
}
