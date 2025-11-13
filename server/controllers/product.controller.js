import ApiResponse from "../utils/ApiResponse.js";
import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import { Product } from "../models/product.model.js";
import { User } from "../models/user.model.js";
import { deleteFromImageKit, getFileIdFromUrl, uploadProductOnImageKit } from "../utils/ImageKit.js";
import { getUserById, getUserDetailsById } from "./user.controller.js";


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
    const products = await Product.find({ isApproved: true })
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

    const { productId, action } = req.body; // action: "approve" or "deny"

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
        // Deny - delete the product
        const oldImageFileId = await getFileIdFromUrl(product.productImage);
        if (oldImageFileId) {
            await deleteFromImageKit(oldImageFileId);
        }
        await Product.findByIdAndDelete(productId);

        return res.status(200).json(
            new ApiResponse(
                200,
                {},
                "Product approval denied and product removed"
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
    const { productId } = req.params;

    const product = await getProductDetailsByProductId(productId);

    const user = req.user;

    if (user.role !== 'company' || user.accountStatus !== 'approved') {
        throw new ApiError(403, "Only approved companies can update product details");
    }

    if (product.companyId.toString() !== user._id.toString()) {
        throw new ApiError(403, "You are not authorized to update this product details");
    }

    const {
        name,
        description,
        category,
        nutritionalInfo,
        diseases,
        certifications,
        alternatives,
        ingredients,
        price,
        tags,
    } = req.body;

    const safeParse = (value, fieldName) => {
        if (value === undefined) return undefined;
        if (typeof value === 'string') {
            try {
                return JSON.parse(value);
            } catch (err) {
                throw new ApiError(400, `Invalid JSON for field '${fieldName}'`);
            }
        }
        return value;
    };

    const updatedProduct = await Product.findByIdAndUpdate(
        product._id,
        {
            $set: {
                name: name ?? product.name,
                description: description ?? product.description,
                category: category ?? product.category,
                nutritionalInfo: safeParse(nutritionalInfo, 'nutritionalInfo') ?? product.nutritionalInfo,
                diseases: safeParse(diseases, 'diseases') ?? product.diseases,
                certifications: safeParse(certifications, 'certifications') ?? product.certifications,
                alternatives: safeParse(alternatives, 'alternatives') ?? product.alternatives,
                ingredients: safeParse(ingredients, 'ingredients') ?? product.ingredients,
                price: price ?? product.price,
                tags: safeParse(tags, 'tags') ?? product.tags,
            }
        },
        { new: true }
    );

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                updatedProduct,
            },
            "Product details updated successfully"
        )
    );

    

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