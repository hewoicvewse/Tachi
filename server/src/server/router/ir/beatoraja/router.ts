import { Router } from "express";
import db from "../../../../external/mongo/db";
import { Random20Hex } from "../../../../utils/misc";
import { PRIVATEINFO_GetUserCaseInsensitive } from "../../../../utils/user";
import prValidate from "../../../middleware/prudence-validate";
import { PasswordCompare } from "../../api/v1/auth/auth";
import chartsRouter from "./charts/router";

const router: Router = Router({ mergeParams: true });

/**
 * Takes a username and password and returns a unique auth token for the user
 * to make ir requests with.
 * @name POST /ir/beatoraja/login
 */
router.post(
    "/login",
    prValidate({
        username: "string",
        password: "string",
    }),
    async (req, res) => {
        const userDoc = await PRIVATEINFO_GetUserCaseInsensitive(req.body.username);

        if (!userDoc) {
            return res.status(404).json({
                success: false,
                description: `The user ${req.body.username} does not exist.`,
            });
        }

        const validPassword = PasswordCompare(req.body.password, userDoc.password);

        if (!validPassword) {
            return res.status(401).json({
                success: false,
                description: `Invalid password.`,
            });
        }

        // User is who they claim to be.
        const token = Random20Hex();

        await db["beatoraja-auth-tokens"].insert({
            userID: userDoc.id,
            token,
        });

        return res.status(200).json({
            success: true,
            description: `Successfully created auth token.`,
            body: {
                token,
            },
        });
    }
);



router.use("/charts/:chartSHA256", chartsRouter);

export default router;
