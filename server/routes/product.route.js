import { Router } from "express";
import { getAllProducts, getProductById, registerProduct, updateProductDetails, updateProductImage } from "../controllers/product.controller.js";
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

router.get("/get-products", getAllProducts);

router.route("/:productId").post(getProductById);
export default router;