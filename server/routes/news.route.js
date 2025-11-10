import { Router } from "express";
import { getAllNews } from "../controllers/news.controller.js";

const router = Router();

router.route("/get-news").get(getAllNews);

export default router;