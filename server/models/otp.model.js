import mongoose, { Schema } from "mongoose";
import { User } from "./user.model.js";

const otpSchema = new Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },
  otp: { type: String, required: true },
  createdAt: { type: Date, default: Date.now, expires: 180 }, // auto-delete after 3 min
});

export const Otp = mongoose.model("Otp", otpSchema);
