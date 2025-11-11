import crypto from "crypto";
import { Otp } from "../models/otp.model.js";
import { User } from "../models/user.model.js";
import ApiResponse from "../utils/ApiResponse.js";
import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import { sendEmail } from "../utils/sendEmail.js";


export const requestOtp = asyncHandler(async (req, res) => {
    const userId = req.user._id;

    if (!userId) {
        throw new ApiError(409, "Unauthorized user not found")
    }

    const user = await User.findById(userId);

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    if (user.accountStatus === "verified")
        throw new ApiError(400, "User already verified");

    const existingOtp = await Otp.findOne({ user: userId });
    if (existingOtp) {
        const diff = (Date.now() - existingOtp.createdAt.getTime()) / 1000;
        if (diff < 60)
            throw new ApiError(429, `Please wait ${Math.ceil(60 - diff)}s before resending OTP.`);
        await Otp.deleteMany({ user: userId });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const hashedOtp = crypto.createHash("sha256").update(otp).digest("hex");

    await Otp.create({ user: userId, otp: hashedOtp });

    await sendEmail(user.email, "Verify Your Account", `Your OTP is ${otp}. It expires in 3 minutes.`);

    return res.status(200).json(new ApiResponse(200, {}, "OTP sent successfully"));
});

export const verifyOtp = asyncHandler(async (req, res) => {
    const userId = req.user._id;

    if (!userId) {
        throw new ApiError(409, "Unauthorized user not found")
    }

    const user = await User.findById(userId);

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    const { otp } = req.body;
    if (!otp) throw new ApiError(400, "OTP required");

    const record = await Otp.findOne({ user: userId });
    if (!record) throw new ApiError(400, "Invalid or expired OTP");

    const hashedInput = crypto.createHash("sha256").update(otp).digest("hex");
    if (hashedInput !== record.otp) throw new ApiError(400, "Incorrect OTP");

    await User.updateOne({ _id: userId }, { accountStatus: "verified" });
    await Otp.deleteMany({ user: userId });

    return res.status(200).json(new ApiResponse(200, {}, "Account verified successfully"));
});