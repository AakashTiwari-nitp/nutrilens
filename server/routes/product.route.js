import { Router } from "express";
import { getAllProducts, getProductById, registerProduct, updateProductDetails, updateProductImage, deleteProduct, getPendingProductApprovals, handleProductApproval, getApprovedProducts, removeProductApproval, getProductRatingByMLModel, markDenialNotificationViewed, getProductPublicRating, rateProduct } from "../controllers/product.controller.js";
import { authenticateUser } from "../middlewares/user.auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();

router.route("/register").post(
    authenticateUser,
    upload.single("productImage"),
    registerProduct
);

router.route("/update-image/:productId").patch(
    authenticateUser,
    upload.single("productImage"),
    updateProductImage
)

// Add upload middleware - make it optional by using upload.single
router.route("/update-product/:productId").patch(
    authenticateUser,
    upload.single("productImage"), // Add this line
    updateProductDetails
)

router.route("/delete/:productId").delete(
    authenticateUser,
    deleteProduct
)

// Product approval routes (Admin only)
router.route("/pending-approvals").get(authenticateUser, getPendingProductApprovals);
router.route("/handle-approval").post(authenticateUser, handleProductApproval);
router.route("/approved-products").get(authenticateUser, getApprovedProducts);
router.route("/remove-approval").post(authenticateUser, removeProductApproval);

router.get("/get-products", getAllProducts);
router.post("/mark-denial-viewed", authenticateUser, markDenialNotificationViewed);

// Public endpoint to fetch public rating and optionally the current user's rating
router.get("/:productId/public-rating", getProductPublicRating);

// Submit or update current user's rating for a product (authenticated)
router.post("/:productId/rate", authenticateUser, rateProduct);

router.route("/:productId").get(getProductById);
export default router;