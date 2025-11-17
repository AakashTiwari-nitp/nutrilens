import mongoose, { Schema } from 'mongoose';

const ratingSchema = new Schema(
    {
        product: {
            type: Schema.Types.ObjectId,
            ref: 'Product',
            required: true,
        },
        ratedBy: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        rating: {
            type: Number,
            required: true,
            min: 1,
            max: 5,
        },
    }
    , { timestamps: true }
    );
    // Add an index to make lookups fast and ensure one rating per user per product
    ratingSchema.index({ product: 1, ratedBy: 1 }, { unique: true });

// Create and export Mongoose model
export const RatingModel = mongoose.model("Rating", ratingSchema);