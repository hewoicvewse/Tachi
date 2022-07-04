import { IIDXDans } from "lib/constants/classes";
import { ServerConfig } from "lib/setup/config";
import nodeFetch from "utils/fetch";
import { HasOwnProperty, IsRecord } from "utils/misc";
import { CreateURLWithParams } from "utils/url";
import type { ClassHandler } from "../../../framework/user-game-stats/types";

export async function CreateArcIIDXClassHandler(
	profileID: string,
	token: string,
	fetch = nodeFetch
): Promise<ClassHandler> {
	let json: unknown;
	let err: unknown;

	// SP and DP dans are located in the same place,
	// fetch once, then return a function that traverses this data.
	try {
		const url = CreateURLWithParams(`${ServerConfig.ARC_API_URL}/api/v1/iidx/28/profiles/`, {
			_id: profileID,
		});

		const res = await fetch(url.href, {
			headers: {
				Authorization: `Bearer ${token}`,
			},
		});

		json = (await res.json()) as unknown;
	} catch (e) {
		err = e;
	}

	return (game, playtype, userID, ratings, logger) => {
		if (err !== undefined) {
			logger.error(
				`An error occured while updating classes for ${ServerConfig.ARC_API_URL}.`,
				{ err }
			);
			return {};
		}

		if (!IsRecord(json)) {
			logger.warn(`ARC returned a non-record as their JSON? Can't handle class updates.`, {
				json,
			});
			return {};
		}

		// we're just going to lazily path directly towards the rank.
		// if ARC sends us an unexpected JSON structure or whatever
		// we wont crash.
		let arcClass: string | null | undefined;

		if (playtype === "SP") {
			// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
			arcClass = (json as any)._items?.[0]?.sp?.rank;
		} else if (playtype === "DP") {
			// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
			arcClass = (json as any)._items?.[0]?.dp?.rank;
		} else {
			logger.error(`ARCIIDXClassUpdater called with invalid playtype of ${playtype}.`);
			return {};
		}

		if (arcClass === null) {
			return {};
		}

		// arc's classes sometimes have trailing/leading spaces.
		const trimmedArcClass = (arcClass ?? "").trim();

		if (!HasOwnProperty(ARCClasses, trimmedArcClass)) {
			logger.warn(`Invalid dan sent from ARC ${trimmedArcClass}. Ignoring.`);
			return {};
		}

		return {
			dan: ARCClasses[trimmedArcClass],
		};
	};
}

const ARCClasses = {
	皆伝: IIDXDans.KAIDEN,
	中伝: IIDXDans.CHUUDEN,
	十段: IIDXDans.DAN_10,
	九段: IIDXDans.DAN_9,
	八段: IIDXDans.DAN_8,
	七段: IIDXDans.DAN_7,
	六段: IIDXDans.DAN_6,
	五段: IIDXDans.DAN_5,
	四段: IIDXDans.DAN_4,
	三段: IIDXDans.DAN_3,

	// These two look very similar but they aren't
	// and ARC uses both, from what I can tell.
	// How nice of them.
	二段: IIDXDans.DAN_2,
	ニ段: IIDXDans.DAN_2,

	初段: IIDXDans.DAN_1,
	一級: IIDXDans.KYU_1,
	二級: IIDXDans.KYU_2,
	三級: IIDXDans.KYU_3,
	四級: IIDXDans.KYU_4,
	五級: IIDXDans.KYU_5,
	六級: IIDXDans.KYU_6,
	七級: IIDXDans.KYU_7,
};