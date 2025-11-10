import ApiResponse from "../utils/ApiResponse.js";
import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import { News } from "../models/news.model.js";
import { deleteFromImageKit, getFileIdFromUrl, uploadNewsImageOnImageKit } from "../utils/ImageKit.js";
import { getUserDetailsById } from "./user.controller.js";

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

export const getNewsById = async (newsId) => {
    const news = await News.findById(newsId);

    if (!news) {
        throw new ApiError(404, "News not found")
    }

    return news;
};

export const createNews = asyncHandler(async (req, res, next) => {

    const { title, shortDescription, content } = req.body;

    const user = await getUserDetailsById(req.user?._id);

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    if (user.role !== 'admin' || user.accountStatus !== 'approved') {
        throw new ApiError(403, "Only approved user can create images");
    }

    if (!title || !shortDescription || !content) {
        throw new ApiError(400, "Please provide all required fields");
    }

    const newsImageLocalPath = req.file?.path;

    if (!newsImageLocalPath) {
        throw new ApiError(400, "News image is required");
    }

    const newsImage = await uploadNewsImageOnImageKit(newsImageLocalPath);

    if (!newsImage || newsImage.error) {
        throw new ApiError(500, "Failed to upload news image");
    }

    const news = await News.create({
        title,
        shortDescription,
        content,
        newsImage: newsImage.url,
        author: user._id
    });

    const createdNews = await getNewsById(news._id);

    if (!createNews) {
        throw new ApiError(500, "Something went wrong while creating the news");
    }

    return res.status(200).json(
        new ApiResponse(
            200,
            createdNews,
            "News Created Successfully",
        )
    );

});

export const updateNewsImage = asyncHandler(async (req, res, next) => {
    const { newsId } = req.params;

    const news = await getNewsById(newsId);

    if (!news) {
        throw new ApiError(404, "News not found");
    }

    if (news.author.toString() !== req.user?._id.toString()) {
        throw new ApiError(403, "You are not authorized to update this news image");
    }

    const newsImageLocalPath = req.file?.path;

    if (!newsImageLocalPath) {
        throw new ApiError(400, "News image is required");
    }

    const oldImageUrl = news.newsImage;
    console.log("Old Image URL:", oldImageUrl);

    const newsImage = await uploadNewsImageOnImageKit(newsImageLocalPath);

    if (!newsImage || newsImage.error) {
        throw new ApiError(500, "Failed to upload news image");
    }

    news.newsImage = newsImage.url;

    await news.save();

    const oldImageFileId = await getFileIdFromUrl(oldImageUrl);

    if (oldImageFileId) {
        await deleteFromImageKit(oldImageFileId);
    }

    return res.status(200).json(
        new ApiResponse(
            200,
            news,
            "News Image Updated Successfully",
        )
    );
});

export const getNewsDetailsByNewsId = asyncHandler(async (req, res, next) => {
    const { newsId } = req.params;

    const news = await News.findById(newsId).populate("author", "username fullName email");

    if (!news) {
        throw new ApiError(404, "News not found");
    }

    return res.status(200).json(
        new ApiResponse(
            200,
            news,
            "News fetched successfully",
        )
    );
});

export const updateNewsDetails = asyncHandler(async (req, res, next) => {
    const { newsId } = req.params;

    const news = await getNewsById(newsId);

    if (!news) {
        throw new ApiError(404, "News not found");
    }

    if (news.author.toString() !== req.user?._id.toString()) {
        throw new ApiError(403, "You are not authorized to update this news");
    }

    const { title, shortDescription, content } = req.body;

    const updatedNews = await News.findByIdAndUpdate(
        newsId,
        {
            $set: {
                title: title || news.title,
                shortDescription: shortDescription || news.shortDescription,
                content: content || news.content,
            }
        },
        { new: true }
    );

    return res.status(200).json(
        new ApiResponse(
            200,
            updatedNews,
            "News details updated successfully",
        )
    );
});