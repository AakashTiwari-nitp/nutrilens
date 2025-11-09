import { Router } from "express";
import { getAllProducts, getProductById, registerProduct } from "../controllers/product.controller.js";
import { authenticateUser } from "../middlewares/user.auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();

router.route("/register").post(
    authenticateUser,
    upload.single("productImage"),
    registerProduct
);

router.get("/get-products", getAllProducts);

router.route("/:id").post(getProductById);
export default router;