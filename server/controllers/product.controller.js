import ApiResponse from "../utils/ApiResponse.js";
import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import { Product } from "../models/product.model.js";
import { User } from "../models/user.model.js";
import { uploadProductOnImageKit } from "../utils/ImageKit.js";
import { getUserDetailsById } from "./user.controller.js";

export const getProductById = asyncHandler(async (req, res, next) => {
    const productId = req.params.id;

    const product = await getProductDetailsById(productId);

    return res.status(200).json(ApiResponse.success("Product fetched successfully", product));
});

export const getProductDetailsById = async (productId) => {
    const product = await Product.findById(productId);

    if (!product) {
        throw new ApiError(404, "Product not found");
    }

    return product;
};

export const registerProduct = asyncHandler(async (req, res, next) => {
    const { name, category, description, productId, nutritionalInfo, ingredients, manufacturingDate, expiryDate, price, tags } = req.body;

    const user = await getUserDetailsById(req.user?._id);

    if (user.role !== 'company' || user.accountStatus !== 'approved') {
        throw new ApiError(403, "Only approved companies can register products");
    }

    console.log(`Registering product with ID: ${productId}`);
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
    });

    const createdProduct = await getProductDetailsById(product._id);

    if (!createdProduct) {
        throw new ApiError(500, "Something went wrong while creating product");
    }

    await User.findByIdAndUpdate(
        user._id,
        { $push: { products: createdProduct._id } },
        { new: true }
    );

    return res.status(201).json(
        new ApiResponse(
            201,
            {
                createdProduct,
            },
            "Product registered successfully"
        )
    );
});

export const getAllProducts = asyncHandler(async (req, res, next) => {
    const products = await Product.find().select('-nutritionalInfo -ingredients -createdAt -updatedAt -__v -certifications -alternatives -diseases');

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                products,
            },
            "Products fetched successfully"
        )
    );
});