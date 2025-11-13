import mongoose, { Schema } from "mongoose";

const productSchema = new Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },
        isApproved: {
            type: Boolean,
            default: false,
        },
        description: {
            type: String,
            required: true,
            trim: true,
        },
        category: {
            type: String,
            required: true,
            enum: ['biscuits', 'breakfast and spreads', 'chocolates and desserts', 'cold drinks and juices', 'dairy, bread and eggs', 'instant foods', 'snacks', 'cakes and bakes', 'dry fruits, oil and masalas', 'meat', 'rice, atta and dals', 'tea, coffee and more', 'supplements and mores'],
        },
        productId: {
            type: Number,
            required: true,
            unique: true,
        },
        nutritionalInfo: {
            type: Object,
            required: true,
        },
        ingredients: [
            {
                type: String,
                required: true,
            }
        ],
        manufacturingDate: {
            type: Date,
            required: true,
        },
        expiryDate: {
            type: Date,
            required: true,
        },
        publicRating: {
            type: Number,
            default: 0.0,
            min: [0, 'Rating cannot be less than 0'],
            max: [5, 'Rating cannot be more than 5']
        },
        diseases: [{
            type: String,
            default: []
        }],
        productImage: {
            type: String,
            required: true,
        },
        certifications: [{
            type: String,
        }],
        publicReviews: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: "Review",
        }],
        alternatives: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product",
        }],
        companyId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        price: {
            type: Number,
            required: true,
        },
        // In the productSchema, add:
        approvalRequested: {
            type: Boolean,
            default: false,
        },
        isDenied: {
            type: Boolean,
            default: false,
        },
        denialReason: {
            type: String,
            trim: true,
        },
        denialNotificationViewed: {
            type: Boolean,
            default: false,
        },
        tags: [{
            type: String,
            enum: ['vegan', 'vegetarian', 'gluten-free', 'sugar-free', 'low-fat', 'organic', 'non-GMO', 'high-protein', 'keto-friendly', 'paleo-friendly', 'dairy-free', 'nut-free', 'soy-free'],
        }]
    }, { timestamps: true }
);

export const Product = mongoose.model("Product", productSchema);