import ApiResponse from "../utils/ApiResponse.js";
import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import { News } from "../models/news.model.js";

export const getAllNews = asyncHandler(async (req, res, next) => {
    const newsList = await News.find().populate("author", "username fullName email");
    
    return res.status(200).json(
        new ApiResponse(
            200,
            {
                news: newsList,
            },
            "News fetched successfully"
        )
    );
});