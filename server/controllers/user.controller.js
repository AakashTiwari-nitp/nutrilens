import ApiResponse from "../utils/ApiResponse.js";
import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js";
import { deleteFromImageKit, getFileIdFromUrl, uploadAvatarOnImageKit } from "../utils/ImageKit.js";
import jwt from "jsonwebtoken";

export const getUserById = asyncHandler(async (req, res, next) => {
    console.log(req.params);
    const userId = req.params.id;

    const user = await getUserDetailsById(userId);

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                user,
            },
            "User fetched successfully"
        )
    );
});

export const getMyProfile = asyncHandler(async (req, res, next) => {
    const userId = req.user?._id;

    const user = await getUserDetailsById(userId);

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                user,
            },
            "User fetched successfully"
        )
    );
});

export const getUserDetailsById = async (userId) => {
    // console.log(`Getting user by ID: ${userId}`);
    if (!userId) {
        throw new ApiError(400, "User ID is required");
    }

    const user = await User.findById(userId).select("-password -refreshToken");

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    // console.log(user);

    return user;
};

export const generateAccessAndRefreshToken = async (userId) => {
    // console.log(userId);
    try {
        const user = await getUserDetailsById(userId);
        // console.log(user);

        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        // console.log(`AccessToken : ${accessToken} refreshToken: ${refreshToken}`);

        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });

        return { accessToken, refreshToken };
    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating refresh and access token");
    }
};

export const registerUser = asyncHandler(async (req, res, next) => {
    // console.log(req.body);
    const { fullName, email, username, password, role } = req.body;
    // console.log(`email: ${email}`);

    if (
        [fullName, email, password, username].some((field) => !field || field?.trim() === "")
    ) {
        throw new ApiError(400, "All fields are required")
    }

    const existedUser = await User.findOne({
        $or: [{ email: email?.toLowerCase() }, { username: username?.toLowerCase() }]
    });

    if (existedUser) {
        throw new ApiError(409, "User with username or email already exists");
    }

    const user = await User.create({
        fullName,
        email: email.toLowerCase(),
        role: role || 'user',
        username: username.toLowerCase(),
        password
    });

    const createdUser = await getUserDetailsById(user._id);
    // console.log(createdUser);

    if (!createdUser) {
        throw new ApiError(500, "Something Went Wrong while creating a new user.")
    }

    return res.status(201).json(
        new ApiResponse(
            201,
            {
                createdUser,
            },
            "User Created Successfully"
        )
    )
});

export const loginUser = asyncHandler(async (req, res, next) => {
    const { username, email, password } = req.body;
    // console.log(`username: ${username}, email: ${email}`)

    if (!password) {
        throw new ApiError(400, "Password is required");
    }

    if (!username && !email) {
        throw new ApiError(400, "Username or Email is required");
    }

    // Build query conditions - only include fields that are provided
    const queryConditions = [];
    if (username) {
        queryConditions.push({ username: username.toLowerCase().trim() });
    }
    if (email) {
        queryConditions.push({ email: email.toLowerCase().trim() });
    }

    const user = await User.findOne({
        $or: queryConditions
    })

    if (!user) {
        throw new ApiError(404, "User doesn't exist");
    }

    const isPasswordValid = await user.isPasswordCorrect(password);

    if (!isPasswordValid) {
        throw new ApiError(401, "Incorrect Password.");
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id);

    // console.log(`AccessToken : ${accessToken} refreshToken: ${refreshToken}`);

    const loggedInUser = await getUserDetailsById(user._id);

    const options = {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
    }

    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(
                200,
                {
                    user: loggedInUser,
                    accessToken,
                    refreshToken
                },
                "User logged In Successfully!"
            )
        )
});

export const logoutUser = asyncHandler(async (req, res, next) => {
    const user = await User.findByIdAndUpdate(req.user._id,
        {
            $unset: { refreshToken: 1 }
        },
        {
            new: true,
        }
    ).select("-password");

    const options = {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
    }

    return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(
            new ApiResponse(
                200,
                {
                    user: user,
                },
                "User logged out successfully"
            )
        );
});

export const refreshAccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken = req.cookies?.refreshToken || req.body?.refreshToken;

    if (!incomingRefreshToken) {
        throw new ApiError(401, "Unauthorized Request!");
    }

    try {
        const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET);

        const user = await getUserDetailsById(decodedToken._id);

        if (!user) {
            throw new ApiError(401, "Invalid Refresh Token")
        }

        if (incomingRefreshToken !== user.refreshToken) {
            throw new ApiError(401, "Refresh Token is expired or used");
        }

        const options = {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
        }

        const { accessToken, refreshToken: newRefreshToken } = await generateAccessAndRefreshToken(user._id);

        res
            .status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", newRefreshToken, options)
            .json(
                new ApiResponse(
                    200,
                    { accessToken, refreshToken: newRefreshToken },
                    "Access token refreshed"
                )
            )
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid Refresh Token")
    }


});

export const updateUserAvatar = asyncHandler(async (req, res, next) => {
    const userId = req.user._id;

    const user = await getUserDetailsById(userId);

    const oldAvatarUrl = user.avatar || "";

    const oldImageFileId = await getFileIdFromUrl(oldAvatarUrl);

    const avatarLocalPath = req.file?.path;

    if (!avatarLocalPath) {
        throw new ApiError(400, "Please provide a valid avatar image");
    }

    const avatar = await uploadAvatarOnImageKit(avatarLocalPath, user.username);

    if (!avatar || avatar.error) {
        throw new ApiError(500, "Failed to upload avatar image");
    }

    const updatedUser = await User.findByIdAndUpdate(
        userId,
        {
            $set: { avatar: avatar.url }
        },
        { new: true }
    ).select("-password -refreshToken");

    // Delete old avatar if exists (pass fileId from the response)
    if (updatedUser && oldAvatarUrl) {
        await deleteFromImageKit(oldImageFileId);
    }

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                user: updatedUser,
            },
            "User avatar updated successfully"
        )
    );
});

export const updateUserAccountDetails = asyncHandler(async (req, res, next) => {
    const userId = req.user._id;
    const user = await getUserDetailsById(userId);

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    const {
        fullName,
        email,
        mobile,
        address,
        country,
        dob,
        weight,
        height,
        gender,
        isVeg,
        companyRegistrationNo,
        gstNo
    } = req.body || {};

    let newWeight, newHeight, bmi;
    newWeight = weight || user.weight;
    newHeight = height || user.height;

    if (newWeight && newHeight) {
        bmi = newWeight / ((newHeight / 100) ** 2);
    } else {
        bmi = user.bmi;
    }

    const updateData = {
        fullName: fullName || user.fullName,
        email: email || user.email,
        mobile: mobile || user.mobile,
        address: address || user.address,
        country: country || user.country,
        dob: dob || user.dob,
        weight: newWeight,
        height: newHeight,
        bmi: bmi || user.bmi,
        gender: gender || user.gender,
        isVeg: isVeg !== undefined ? isVeg : user.isVeg,
    };

    // Add company-specific fields if provided
    if (companyRegistrationNo !== undefined) {
        updateData.companyRegistrationNo = companyRegistrationNo;
    }
    if (gstNo !== undefined) {
        updateData.gstNo = gstNo;
    }

    const updatedUser = await User.findByIdAndUpdate(
        userId,
        { $set: updateData },
        { new: true }
    ).select("-password -refreshToken");

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                user: updatedUser,
            },
            "User account details updated successfully"
        )
    );

});

export const changePassword = asyncHandler(async (req, res, next) => {
    const userId = req.user._id;

    const user = await User.findById(userId);

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    const { currentPassword, newPassword } = req.body;

    const isPasswordCorrect = await user.isPasswordCorrect(currentPassword);

    if (!isPasswordCorrect) {
        throw new ApiError(401, "Incorrect Current Password.");
    }

    user.password = newPassword;
    await user.save({ validateBeforeSave: false });

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                {},
                "Password Changed Successfully"
            )
        );
});

export const getAllProductsOfTheCompany = asyncHandler(async (req, res, next) => {
    const userId = req.user._id;

    const user = await User.findById(userId)
        .select("-password -refreshToken")
        .populate('products', 'name category description productId price productImage isApproved');

    // console.log(user)

    const products = user.products || [];

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

// Request verification (Company only)
export const requestVerification = asyncHandler(async (req, res, next) => {
    const userId = req.user._id;
    const user = await User.findById(userId);

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    if (user.role !== "company") {
        throw new ApiError(403, "Only companies can request verification");
    }

    if (user.accountStatus === "verified") {
        throw new ApiError(400, "Company is already verified");
    }

    if (user.verificationRequested) {
        throw new ApiError(400, "Verification request already pending");
    }

    user.verificationRequested = true;
    await user.save();

    return res.status(200).json(
        new ApiResponse(
            200,
            {},
            "Verification request submitted successfully"
        )
    );
});

// Get pending verification requests (Admin only)
export const getPendingVerificationRequests = asyncHandler(async (req, res, next) => {
    const adminId = req.user._id;
    const admin = await User.findById(adminId);

    if (!admin || admin.role !== "admin") {
        throw new ApiError(403, "Only admins can access this endpoint");
    }

    const pendingRequests = await User.find({
        role: "company",
        verificationRequested: true,
        accountStatus: { $ne: "verified" }
    })
        .select("-password -refreshToken")
        .sort({ createdAt: -1 });

    return res.status(200).json(
        new ApiResponse(
            200,
            { requests: pendingRequests },
            "Pending verification requests fetched successfully"
        )
    );
});

// Approve or deny verification request (Admin only)
export const handleVerificationRequest = asyncHandler(async (req, res, next) => {
    const adminId = req.user._id;
    const admin = await User.findById(adminId);

    if (!admin || admin.role !== "admin") {
        throw new ApiError(403, "Only admins can handle verification requests");
    }

    const { companyId, action } = req.body; // action: "approve" or "deny"

    if (!companyId || !action) {
        throw new ApiError(400, "Company ID and action are required");
    }

    if (action !== "approve" && action !== "deny") {
        throw new ApiError(400, "Action must be 'approve' or 'deny'");
    }

    const company = await User.findById(companyId);

    if (!company || company.role !== "company") {
        throw new ApiError(404, "Company not found");
    }

    if (!company.verificationRequested) {
        throw new ApiError(400, "No pending verification request for this company");
    }

    if (action === "approve") {
        company.accountStatus = "verified";
        company.verificationRequested = false;
        await company.save();

        return res.status(200).json(
            new ApiResponse(
                200,
                { company },
                "Company verified successfully"
            )
        );
    } else {
        // Deny - just reset the verification request
        company.verificationRequested = false;
        await company.save();

        return res.status(200).json(
            new ApiResponse(
                200,
                {},
                "Verification request denied"
            )
        );
    }
});

// Get all verified companies (Admin only)
export const getVerifiedCompanies = asyncHandler(async (req, res, next) => {
    const adminId = req.user._id;
    const admin = await User.findById(adminId);

    if (!admin || admin.role !== "admin") {
        throw new ApiError(403, "Only admins can access this endpoint");
    }

    const verifiedCompanies = await User.find({
        role: "company",
        accountStatus: "verified"
    })
        .select("-password -refreshToken")
        .sort({ createdAt: -1 });

    return res.status(200).json(
        new ApiResponse(
            200,
            { companies: verifiedCompanies },
            "Verified companies fetched successfully"
        )
    );
});

// Remove company verification (Admin only)
export const removeCompanyVerification = asyncHandler(async (req, res, next) => {
    const adminId = req.user._id;
    const admin = await User.findById(adminId);

    if (!admin || admin.role !== "admin") {
        throw new ApiError(403, "Only admins can remove company verification");
    }

    const { companyId } = req.body;

    if (!companyId) {
        throw new ApiError(400, "Company ID is required");
    }

    const company = await User.findById(companyId);

    if (!company || company.role !== "company") {
        throw new ApiError(404, "Company not found");
    }

    if (company.accountStatus !== "verified") {
        throw new ApiError(400, "Company is not verified");
    }

    company.accountStatus = "pending";
    await company.save();

    return res.status(200).json(
        new ApiResponse(
            200,
            { company },
            "Company verification removed successfully"
        )
    );
});