import { Router } from "express";
import { requestOtp, verifyOtp } from "../controllers/otp.controller.js";
import { authenticateUser } from "../middlewares/user.auth.middleware.js";

const router = Router();

router.route("/request").post(
    authenticateUser,
    requestOtp
);

router.route("/verify").post(
    authenticateUser,
    verifyOtp
);

export default router;
