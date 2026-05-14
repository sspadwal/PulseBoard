import mongoose from "mongoose";

const answerSchema = new mongoose.Schema(
  {
    questionId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    selectedOptionId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
  },
  { _id: false },
);

const responseSchema = new mongoose.Schema(
  {
    pollId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Poll",
      required: true,
    },
    respondentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    answers: {
      type: [answerSchema],
      validate: {
        validator: (a) => a.length >= 1,
        message: "Response must have at least one answer",
      },
    },
    ipHash: {
      type: String,
    },
    submittedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true },
);

responseSchema.index(
  { pollId: 1, respondentId: 1 },
  {
    unique: true,
    partialFilterExpression: {
      respondentId: { $exists: true, $ne: null },
    },
  },
);

responseSchema.index(
  { pollId: 1, ipHash: 1 },
  {
    unique: true,
    partialFilterExpression: {
      ipHash: { $exists: true, $type: "string", $gt: "" },
    },
  },
);

const Response = mongoose.model("Response", responseSchema);
export default Response;
