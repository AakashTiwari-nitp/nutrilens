import mongoose, { Schema } from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const userSchema = new Schema(
    {
        username: {
            type: String,
            unique: true,
            required: true,
            lowercase: true,
            trim: true,
            index: true,
        },
        password: {
            type: String,
            required: [true, 'Password is required'],
        },
        email: {
            type: String,
            unique: true,
            required: [true, 'Email is required'],
            lowercase: true,
            trim: true,
        },
        fullName: {
            type: String,
            required: true,
            trim: true,
            index: true,
        },
        avatar: {
            type: String,
        },
        role: {
            type: String,
            enum: ['user', 'admin', 'company'],
            default: 'user',
        },
        mobile: {
            type: String,
            trim: true,
        },
        address: {
            type: String,
            trim: true,
        },
        country: {
            type: String,
            trim: true,
        },
        refreshToken: {
            type: String
        },
        dob: {
            type: Date,
            required: false,
        },
        products: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product",
        }],
        weight: {
            type: Number,
        },
        height: {
            type: Number,
        },
        bmi: {
            type: Number,
        },
        gender: {
            type: Boolean,
            enum: [true, false],
            required: false,
        },
        favourites: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product",
        }],
        isVeg: {
            type: Boolean,
            required: false,
        },
        history: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product",
        }],
        accountStatus: {
            type: String,
            enum: ['approved', 'verified', 'banned', 'pending'],
            default: 'pending',
        },
        news: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: "News",
        }],
        companyRegistrationNo: {
            type: String,
            trim: true,
        },
        gstNo: {
            type: String,
            trim: true,
        },
        verificationRequested: {
            type: Boolean,
            default: false,
        }
    }, { timestamps: true, }
);


userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();

    this.password = await bcrypt.hash(this.password, 10);
    next();
});

userSchema.methods.isPasswordCorrect = async function (password) {
    return await bcrypt.compare(password, this.password);
};

userSchema.methods.generateAccessToken = function () {
    return jwt.sign(
        {
            _id: this._id,
            email: this.email,
            username: this.username,
            fullName: this.fullName,
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
        }
    );
}

userSchema.methods.generateRefreshToken = function () {
    return jwt.sign(
        {
            _id: this._id,
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }
    );
}


export const User = mongoose.model("User", userSchema);