import { Router } from "express";
import { getUserById, getMyProfile, registerUser, loginUser, logoutUser, refreshAccessToken, updateUserAvatar, updateUserAccountDetails, changePassword, getAllProductsOfTheCompany, requestVerification, getPendingVerificationRequests, handleVerificationRequest, getVerifiedCompanies, removeCompanyVerification } from "../controllers/user.controller.js";
import { authenticateUser } from "../middlewares/user.auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();

router.route("/register").post(registerUser);

router.route("/login").post(loginUser);

// protected routes
router.route("/logout").post(authenticateUser, logoutUser);

router.route('/refresh-token').post(refreshAccessToken);

router.route("/update-avatar").patch(
    authenticateUser,
    upload.single("avatar"),
    updateUserAvatar
);

router.route("/update-account").patch(
    authenticateUser, 
    updateUserAccountDetails
)

router.route("/change-password").post(authenticateUser, changePassword);

router.route("/get-all-products").get(authenticateUser, getAllProductsOfTheCompany);

router.route("/profile").get(authenticateUser, getMyProfile);

// Verification routes
router.route("/request-verification").post(authenticateUser, requestVerification);
router.route("/pending-verifications").get(authenticateUser, getPendingVerificationRequests);
router.route("/handle-verification").post(authenticateUser, handleVerificationRequest);
router.route("/verified-companies").get(authenticateUser, getVerifiedCompanies);
router.route("/remove-verification").post(authenticateUser, removeCompanyVerification);

router.route("/:id").get(getUserById)

export default router;