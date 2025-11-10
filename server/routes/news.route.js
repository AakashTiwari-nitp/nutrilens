import { Router } from "express";
import { createNews, getAllNews, getNewsDetailsByNewsId, updateNewsDetails, updateNewsImage } from "../controllers/news.controller.js";
import { authenticateUser } from "../middlewares/user.auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();

router.route("/get-news").get(getAllNews);

router.route("/create").post(
    authenticateUser,
    upload.single("newsImage"),
    createNews
);

router.route("/update-newsImage/:newsId").patch(
    authenticateUser,
    upload.single("newsImage"),
    updateNewsImage
);

router.route("/update-news-details/:newsId").patch(
    authenticateUser,
    updateNewsDetails
);

router.route("/:newsId").get(getNewsDetailsByNewsId);

export default router;