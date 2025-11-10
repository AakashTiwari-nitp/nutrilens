import mongoose, { Schema } from "mongoose";

const newsSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
        },
        shortDescription: {
            type: String,
            required: true,
        },
        content: {
            type: String,
            required: true,
        },
        image: {
            type: String,
            required: true,
        },
        author: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        }
    },
    { timestamps: true }
);

export const News = mongoose.model("News", newsSchema);