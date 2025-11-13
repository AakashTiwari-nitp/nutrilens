import { Router } from "express";
import { getAllProducts, getProductById, registerProduct, updateProductDetails, updateProductImage, deleteProduct, getPendingProductApprovals, handleProductApproval, getApprovedProducts, removeProductApproval,getProductRatingByMLModel } from "../controllers/product.controller.js";
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

router.route("/update-product/:productId").patch(
    authenticateUser,
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

router.route("/:productId").get(getProductById);
export default router;