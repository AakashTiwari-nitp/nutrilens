import ApiResponse from "../utils/ApiResponse.js";
import ApiError from "../utils/ApiError.js";
import jwt from 'jsonwebtoken';
import asyncHandler from "../utils/asyncHandler.js";
import { Product } from "../models/product.model.js";
import { User } from "../models/user.model.js";
import { deleteFromImageKit, getFileIdFromUrl, uploadProductOnImageKit } from "../utils/ImageKit.js";
import { getUserById, getUserDetailsById } from "./user.controller.js";
import { RatingModel } from "../models/ratingModel.js";


export const getProductById = asyncHandler(async (req, res, next) => {
    // console.log("Fetching product by ID", req.params.productId);
    const { productId } = req.params;

    const product = await getProductDetailsByProductId(productId);

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                product,
            },
            "Product fetched successfully"
        )
    );
});

export const getAllProducts = asyncHandler(async (req, res, next) => {
    // Only get approved products that are not denied
    const products = await Product.find({
        isApproved: true,
        isDenied: { $ne: true } // Explicitly exclude denied products
    })
        .populate('companyId', 'fullName username email')
        .sort({ createdAt: -1 });

    return res.status(200).json(
        new ApiResponse(
            200,
            { products },
            "All products fetched successfully"
        )
    );
});

export const getProductDetailsById = async (productId) => {
    const product = await Product.findById(productId);

    if (!product) {
        throw new ApiError(404, "Product not found");
    }

    return product;
};

export const getProductDetailsByProductId = async (productId) => {
    const product = await Product.findOne({ productId: productId });

    if (!product) {
        throw new ApiError(404, "Product not found");
    }

    return product;
};

export const registerProduct = asyncHandler(async (req, res, next) => {
    const { name, category, description, productId, nutritionalInfo, ingredients, manufacturingDate, expiryDate, price, tags } = req.body;

    const user = await getUserDetailsById(req.user?._id);

    if (user.role !== 'company' || user.accountStatus !== 'verified') {
        throw new ApiError(403, "Only verified companies can register products");
    }

    const existedProduct = await Product.findOne({ productId: productId });

    if (existedProduct) {
        throw new ApiError(409, "Product with this ID already exists");
    }

    if (!name || !category || !nutritionalInfo || !description || !ingredients || !manufacturingDate || !expiryDate || !price) {
        throw new ApiError(400, "Please provide all required fields");
    }

    const productImageLocalPath = req.file?.path;
    if (!productImageLocalPath) {
        throw new ApiError(400, "Product image is required");
    }

    const productImage = await uploadProductOnImageKit(productImageLocalPath, productId);

    if (!productImage || productImage.error) {
        throw new ApiError(500, "Failed to upload product image");
    }

    const product = await Product.create({
        name,
        category,
        productId,
        description,
        nutritionalInfo: JSON.parse(nutritionalInfo),
        ingredients: JSON.parse(ingredients),
        manufacturingDate,
        expiryDate,
        price,
        tags: tags ? JSON.parse(tags) : [],
        productImage: productImage.url,
        companyId: user._id,
        isApproved: false, // Start as unapproved
        approvalRequested: true, // Mark as requested for approval
    });

    const createdProduct = await getProductDetailsById(product._id);

    if (!createdProduct) {
        throw new ApiError(500, "Something went wrong while creating product");
    }

    return res.status(201).json(
        new ApiResponse(
            201,
            {
                createdProduct,
            },
            "Product submitted for approval"
        )
    );
});

// Get pending product approval requests (Admin only)
export const getPendingProductApprovals = asyncHandler(async (req, res, next) => {
    const adminId = req.user._id;
    const admin = await User.findById(adminId);

    if (!admin || admin.role !== "admin") {
        throw new ApiError(403, "Only admins can access this endpoint");
    }

    const pendingProducts = await Product.find({
        approvalRequested: true,
        isApproved: false
    })
        .populate('companyId', 'fullName username email companyRegistrationNo')
        .sort({ createdAt: -1 });

    return res.status(200).json(
        new ApiResponse(
            200,
            { products: pendingProducts },
            "Pending product approval requests fetched successfully"
        )
    );
});

// Approve or deny product request (Admin only)
export const handleProductApproval = asyncHandler(async (req, res, next) => {
    const adminId = req.user._id;
    const admin = await User.findById(adminId);

    if (!admin || admin.role !== "admin") {
        throw new ApiError(403, "Only admins can handle product approvals");
    }

    const { productId, action, denialReason } = req.body; // action: "approve" or "deny"

    if (!productId || !action) {
        throw new ApiError(400, "Product ID and action are required");
    }

    if (action !== "approve" && action !== "deny") {
        throw new ApiError(400, "Action must be 'approve' or 'deny'");
    }

    const product = await Product.findById(productId);

    if (!product) {
        throw new ApiError(404, "Product not found");
    }

    if (!product.approvalRequested) {
        throw new ApiError(400, "No pending approval request for this product");
    }

    if (action === "approve") {
        product.isApproved = true;
        product.approvalRequested = false;
        product.isDenied = false;
        product.denialReason = undefined;
        await product.save();

        // Add product to company's products array
        await User.findByIdAndUpdate(
            product.companyId,
            { $push: { products: product._id } },
            { new: true }
        );

        return res.status(200).json(
            new ApiResponse(
                200,
                { product },
                "Product approved successfully"
            )
        );
    } else {
        // Deny - mark as denied instead of deleting
        product.isApproved = false;
        product.approvalRequested = false;
        product.isDenied = true;
        product.denialReason = denialReason || "Product did not meet approval criteria";
        product.denialNotificationViewed = false; // Company hasn't seen the denial yet
        await product.save();

        return res.status(200).json(
            new ApiResponse(
                200,
                { product },
                "Product approval denied"
            )
        );
    }
});

// Get approved products (Admin only)
export const getApprovedProducts = asyncHandler(async (req, res, next) => {
    const adminId = req.user._id;
    const admin = await User.findById(adminId);

    if (!admin || admin.role !== "admin") {
        throw new ApiError(403, "Only admins can access this endpoint");
    }

    const approvedProducts = await Product.find({
        isApproved: true
    })
        .populate('companyId', 'fullName username email')
        .sort({ createdAt: -1 });

    return res.status(200).json(
        new ApiResponse(
            200,
            { products: approvedProducts },
            "Approved products fetched successfully"
        )
    );
});

// Remove product approval (Admin only)
export const removeProductApproval = asyncHandler(async (req, res, next) => {
    const adminId = req.user._id;
    const admin = await User.findById(adminId);

    if (!admin || admin.role !== "admin") {
        throw new ApiError(403, "Only admins can remove product approval");
    }

    const { productId } = req.body;

    if (!productId) {
        throw new ApiError(400, "Product ID is required");
    }

    const product = await Product.findById(productId);

    if (!product) {
        throw new ApiError(404, "Product not found");
    }

    if (!product.isApproved) {
        throw new ApiError(400, "Product is not approved");
    }

    // Remove from company's products array
    await User.findByIdAndUpdate(
        product.companyId,
        { $pull: { products: product._id } },
        { new: true }
    );

    // Delete the product
    const oldImageFileId = await getFileIdFromUrl(product.productImage);
    if (oldImageFileId) {
        await deleteFromImageKit(oldImageFileId);
    }
    await Product.findByIdAndDelete(productId);

    return res.status(200).json(
        new ApiResponse(
            200,
            {},
            "Product approval removed and product deleted"
        )
    );
});

export const updateProductImage = asyncHandler(async (req, res, next) => {
    const { productId } = req.params;

    const user = await getUserDetailsById(req.user?._id);

    if (user.role !== 'company' || user.accountStatus !== 'approved') {
        throw new ApiError(403, "Only approved companies can update product images");
    }

    const product = await getProductDetailsByProductId(productId);

    if (product.companyId.toString() !== user._id.toString()) {
        throw new ApiError(403, "You are not authorized to update this product image");
    }

    const productImageLocalPath = req.file?.path;
    if (!productImageLocalPath) {
        throw new ApiError(400, "Product image is required");
    }

    const oldImageUrl = product.productImage;

    const oldImageFileId = await getFileIdFromUrl(oldImageUrl);

    const productImage = await uploadProductOnImageKit(productImageLocalPath, productId);

    if (!productImage || productImage.error) {
        throw new ApiError(500, "Failed to upload product image");
    }

    // console.log(productImage);
    product.productImage = productImage.url;
    await product.save();

    // Optionally, you can implement deletion of the old image from ImageKit here using oldImageUrl
    if (oldImageUrl) {
        await deleteFromImageKit(oldImageFileId);
    }


    return res.status(200).json(
        new ApiResponse(
            200,
            {
                product,
            },
            "Product image updated successfully"
        )
    );
});

export const deleteProduct = asyncHandler(async (req, res, next) => {
    const { productId } = req.params;

    const product = await getProductDetailsByProductId(productId);
    const user = await getUserDetailsById(req.user?._id);

    if (user.role !== 'company' || user.accountStatus !== 'verified') {
        throw new ApiError(403, "Only verified companies can delete products");
    }

    if (product.companyId.toString() !== user._id.toString()) {
        throw new ApiError(403, "You are not authorized to delete this product");
    }

    // Delete product image from ImageKit
    const oldImageFileId = await getFileIdFromUrl(product.productImage);
    if (oldImageFileId) {
        await deleteFromImageKit(oldImageFileId);
    }

    // Remove product from user's products array
    await User.findByIdAndUpdate(
        user._id,
        { $pull: { products: product._id } },
        { new: true }
    );

    // Delete the product
    await Product.findByIdAndDelete(product._id);

    return res.status(200).json(
        new ApiResponse(
            200,
            {},
            "Product deleted successfully"
        )
    );
});

export const updateProductDetails = asyncHandler(async (req, res, next) => {
    try {
        const { productId } = req.params;

        if (!productId) {
            throw new ApiError(400, "Product ID is required");
        }

        const product = await getProductDetailsByProductId(productId);

        if (!product) {
            throw new ApiError(404, "Product not found");
        }

        const user = req.user;

        if (!user) {
            throw new ApiError(401, "User not authenticated");
        }

        if (user.role !== 'company' || user.accountStatus !== 'verified') {
            throw new ApiError(403, "Only verified companies can update product details");
        }

        if (product.companyId.toString() !== user._id.toString()) {
            throw new ApiError(403, "You are not authorized to update this product details");
        }

        // Extract fields from req.body (FormData fields come as strings)
        const {
            name,
            description,
            category,
            nutritionalInfo,
            ingredients,
            price,
            manufacturingDate,
            expiryDate,
            tags,
        } = req.body;

        // Validate required fields
        if (!name || !category || !nutritionalInfo || !description || !ingredients || !manufacturingDate || !expiryDate || !price) {
            throw new ApiError(400, "Please provide all required fields");
        }

        // Handle image upload if new image is provided
        let productImageUrl = product.productImage;
        if (req.file?.path) {
            try {
                const oldImageFileId = await getFileIdFromUrl(product.productImage);
                const productImage = await uploadProductOnImageKit(req.file.path, product.productId || productId);

                if (!productImage || productImage.error) {
                    throw new ApiError(500, "Failed to upload product image");
                }

                productImageUrl = productImage.url;

                // Delete old image
                if (oldImageFileId) {
                    await deleteFromImageKit(oldImageFileId);
                }
            } catch (imageError) {
                console.error("Image upload error:", imageError);
                // Continue with existing image if upload fails
            }
        }

        // Parse JSON fields
        let parsedNutritionalInfo, parsedIngredients, parsedTags;

        try {
            parsedNutritionalInfo = typeof nutritionalInfo === 'string' ? JSON.parse(nutritionalInfo) : nutritionalInfo;
            parsedIngredients = typeof ingredients === 'string' ? JSON.parse(ingredients) : ingredients;
            parsedTags = tags ? (typeof tags === 'string' ? JSON.parse(tags) : tags) : [];
        } catch (parseError) {
            throw new ApiError(400, `Invalid JSON format: ${parseError.message}`);
        }

        // Validate parsed data
        if (!parsedNutritionalInfo || typeof parsedNutritionalInfo !== 'object') {
            throw new ApiError(400, "Invalid nutritional information format");
        }

        if (!Array.isArray(parsedIngredients) || parsedIngredients.length === 0) {
            throw new ApiError(400, "Ingredients must be a non-empty array");
        }

        // Update product and set to pending approval
        const updatedProduct = await Product.findByIdAndUpdate(
            product._id,
            {
                $set: {
                    name: name.trim(),
                    description: description.trim(),
                    category: category.trim(),
                    nutritionalInfo: parsedNutritionalInfo,
                    ingredients: parsedIngredients,
                    price: parseFloat(price),
                    manufacturingDate: new Date(manufacturingDate),
                    expiryDate: new Date(expiryDate),
                    tags: parsedTags || [],
                    productImage: productImageUrl,
                    // Reset approval status - requires re-approval
                    isApproved: false,
                    approvalRequested: true,
                    isDenied: false,
                    denialReason: undefined,
                    denialNotificationViewed: false,
                }
            },
            { new: true }
        );

        if (!updatedProduct) {
            throw new ApiError(500, "Failed to update product");
        }

        return res.status(200).json(
            new ApiResponse(
                200,
                {
                    updatedProduct,
                },
                "Product updated successfully. Changes require admin approval."
            )
        );
    } catch (error) {
        // Log the error for debugging
        console.error("Update product error:", error);

        // If it's already an ApiError, pass it through
        if (error instanceof ApiError) {
            throw error;
        }

        // Otherwise, wrap it in an ApiError
        throw new ApiError(500, error.message || "Failed to update product");
    }
});

export const getProductRatingByMLModel = asyncHandler(async (req, res, next) => {
    const { productId } = req.params;

    const product = await getProductDetailsByProductId(productId);
    const nutritionalInfo = product.nutritionalInfo;

    // console.log("Nutritional Info:", nutritionalInfo);

    try {
        const response = await fetch(process.env.ML_MODEL_API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(nutritionalInfo),
        });

        if (!response.ok) {
            throw new ApiError(response.status, "Failed to fetch product rating from ML model");
        }

        const data = await response.json();
        // console.log("ML Model Response:", data);

        if (!data || typeof data.rating === "undefined") {
            throw new ApiError(500, "Invalid response from ML model");
        }

        return res.status(200).json(
            new ApiResponse(200, { rating: data.rating, diseases: data.predicted_disease }, "Product rating fetched successfully")
        );

    } catch (error) {
        console.error("Error fetching rating from ML model:", error);
        return next(new ApiError(500, "Failed to fetch product rating from ML model"));
    }
});

// Mark denial notification as viewed (Company only)
export const markDenialNotificationViewed = asyncHandler(async (req, res, next) => {
    const { productId } = req.body;
    const userId = req.user._id;

    if (!productId) {
        throw new ApiError(400, "Product ID is required");
    }

    const product = await Product.findById(productId);

    if (!product) {
        throw new ApiError(404, "Product not found");
    }

    // Verify the product belongs to the company
    if (product.companyId.toString() !== userId.toString()) {
        throw new ApiError(403, "You are not authorized to view this product's notification");
    }

    product.denialNotificationViewed = true;
    await product.save();

    return res.status(200).json(
        new ApiResponse(
            200,
            { product },
            "Denial notification marked as viewed"
        )
    );
});

export const rateProduct = asyncHandler(async (req, res, next) => {
    const { productId } = req.params;
    const { rating } = req.body;

    if (!productId) {
        throw new ApiError(400, "Product ID is required");
    }

    const numericRating = Number(rating);
    console.log('Received rating payload:', rating, 'type:', typeof rating, 'numericRating:', numericRating);
    if (isNaN(numericRating) || numericRating < 1 || numericRating > 5) {
        throw new ApiError(400, "Rating must be a number between 1 and 5");
    }

    const product = await getProductDetailsByProductId(productId);

    const userId = req.user?._id;
    if (!userId) {
        throw new ApiError(401, "User must be authenticated to rate products");
    }

    // Upsert user's rating for this product
    const updatedRating = await RatingModel.findOneAndUpdate(
        { product: product._id, ratedBy: userId },
        { $set: { rating: numericRating } },
        { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    // Recompute aggregated public rating
    const agg = await RatingModel.aggregate([
        { $match: { product: product._id } },
        {
            $group: {
                _id: "$product",
                averageRating: { $avg: "$rating" },
                numberOfRatings: { $sum: 1 }
            }
        }
    ]);

    let publicRating = { averageRating: 0, numberOfRatings: 0 };
    if (agg && agg.length > 0) {
        publicRating.averageRating = Number(agg[0].averageRating) || 0;
        publicRating.numberOfRatings = Number(agg[0].numberOfRatings) || 0;
    }

    // Persist aggregated rating on product as a small optimization (optional)
    try {
        // store only the numeric average on the product document to match schema
        product.publicRating = publicRating.averageRating;
        await product.save();
    } catch (err) {
        // Non-fatal: if update fails, continue and return computed value
        console.error('Failed to persist product.publicRating:', err.message || err);
    }

    return res.status(200).json(
        new ApiResponse(200, { publicRating, userRating: Number(updatedRating.rating) }, 'Rating submitted successfully')
    );
});

export const getProductPublicRating = asyncHandler(async (req, res, next) => {
    const { productId } = req.params;

    const product = await getProductDetailsByProductId(productId);
    // Compute public rating (average + count)
    const agg = await RatingModel.aggregate([
        { $match: { product: product._id } },
        {
            $group: {
                _id: "$product",
                averageRating: { $avg: "$rating" },
                numberOfRatings: { $sum: 1 }
            }
        }
    ]);

    let publicRating = { averageRating: 0, numberOfRatings: 0 };
    if (agg && agg.length > 0) {
        publicRating.averageRating = Number(agg[0].averageRating) || 0;
        publicRating.numberOfRatings = Number(agg[0].numberOfRatings) || 0;
    } else if (product.publicRating && typeof product.publicRating === 'object') {
        // fallback to stored product.publicRating if present
        publicRating.averageRating = Number(product.publicRating.averageRating) || 0;
        publicRating.numberOfRatings = Number(product.publicRating.numberOfRatings) || 0;
    }

    // Find current user's rating for this product (if token present). We support optional auth here
    let userRating = null;
    try {
        // Try to extract JWT from cookies or Authorization header without requiring authentication middleware
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");
        let userId = null;
        if (token) {
            try {
                const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
                const user = await getUserDetailsById(decoded?._id);
                if (user) userId = user._id;
            } catch (e) {
                // invalid token or user not found — ignore silently
            }
        }

        console.log('User ID for rating lookup:', userId);
        if (userId) {
            const r = await RatingModel.findOne({ product: product._id, ratedBy: userId }).select('rating').lean();
            if (r && typeof r.rating !== 'undefined' && r.rating !== null) {
                userRating = Number(r.rating);
            }
        }
        // console.log('User rating fetched:', userRating);
        // console.log('Public rating computed:', publicRating);
    } catch (err) {
        // ignore user rating lookup errors, still return public rating
        console.error('Error fetching user rating:', err.message || err);
    }

    return res.status(200).json(
        new ApiResponse(200, { publicRating, userRating }, 'Product rating fetched successfully')
    );
});