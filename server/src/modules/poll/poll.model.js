import mongoose from "mongoose";
import { nanoid } from "nanoid";

const optionSchema = new mongoose.Schema(
  {
    text: {
      type: String,
      required: [true, "Option text is required"],
      trim: true,
      maxlength: 200,
    },
    order: {
      type: Number,
      default: 0,
    },
  },
  { _id: true },
);

const questionSchema = new mongoose.Schema(
  {
    text: {
      type: String,
      required: [true, "Question text is required"],
      trim: true,
      maxlength: 500,
    },
    order: {
      type: Number,
      default: 0,
    },
    isMandatory: {
      type: Boolean,
      default: true,
    },
    options: {
      type: [optionSchema],
      validate: {
        validator: (opts) => opts.length >= 2,
        message: "Each question needs at least 2 options",
      },
    },
  },
  { _id: true },
);

const pollSchema = new mongoose.Schema(
  {
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      required: [true, "Poll title is required"],
      trim: true,
      maxlength: 150,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 1000,
      default: "",
    },
    isAnonymous: {
      type: Boolean,
      default: false,
    },
    expiresAt: {
      type: Date,
      required: [true, "Expiry date is required"],
    },
    status: {
      type: String,
      enum: ["draft", "active", "closed", "published"],
      default: "active",
    },
    shareToken: {
      type: String,
      unique: true,
      default: () => nanoid(10),
    },
    questions: {
      type: [questionSchema],
      validate: {
        validator: (qs) => qs.length >= 1,
        message: "Poll must have at least 1 question",
      },
    },
  },
  { timestamps: true },
);

pollSchema.methods.isExpired = function () {
  return new Date() > this.expiresAt;
};

pollSchema.methods.isAcceptingResponses = function () {
  return this.status === "active" && !this.isExpired();
};

pollSchema.index({ shareToken: 1 });
pollSchema.index({ createdBy: 1, status: 1 });

const Poll = mongoose.model("Poll", pollSchema);
export default Poll;
