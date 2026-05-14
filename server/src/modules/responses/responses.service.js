import mongoose from "mongoose";
import Poll from "../poll/poll.model.js";
import Response from "./responses.model.js";
import ApiError from "../../common/utils/api-errors.js";
import { hashIp } from "../../common/utils/ip-hash.utils.js";

function optionBelongsToQuestion(question, optionIdStr) {
  return (question.options || []).some(
    (o) => String(o._id) === optionIdStr,
  );
}

export async function submitResponseByShareToken(shareToken, body, ctx) {
  const { userId, ip } = ctx;
  const poll = await Poll.findOne({ shareToken });
  if (!poll) throw ApiError.notfound("Poll not found");
  if (poll.status === "draft") throw ApiError.notfound("Poll not found");
  if (!poll.isAcceptingResponses()) {
    throw ApiError.badRequest(
      "This poll is not accepting responses (inactive, closed, published, or expired).",
    );
  }
  if (!poll.isAnonymous && !userId) {
    throw ApiError.unauthorized("You must be logged in to respond to this poll");
  }

  const answersInput = body.answers;
  const qIds = answersInput.map((a) => a.questionId);
  if (new Set(qIds).size !== qIds.length) {
    throw ApiError.badRequest("Duplicate question entries in answers");
  }

  const byQuestionId = new Map(
    poll.questions.map((q) => [String(q._id), q]),
  );

  for (const q of poll.questions) {
    if (q.isMandatory && !qIds.includes(String(q._id))) {
      throw ApiError.badRequest(`Missing answer for mandatory question: ${q.text}`);
    }
  }

  const answers = [];
  for (const row of answersInput) {
    const q = byQuestionId.get(row.questionId);
    if (!q) {
      throw ApiError.badRequest("Unknown question for this poll");
    }
    if (!optionBelongsToQuestion(q, row.selectedOptionId)) {
      throw ApiError.badRequest("Selected option does not belong to the question");
    }
    answers.push({
      questionId: new mongoose.Types.ObjectId(row.questionId),
      selectedOptionId: new mongoose.Types.ObjectId(row.selectedOptionId),
    });
  }

  const doc = {
    pollId: poll._id,
    answers,
  };

  if (!poll.isAnonymous) {
    const existing = await Response.findOne({
      pollId: poll._id,
      respondentId: userId,
    });
    if (existing) {
      throw ApiError.conflict("You have already submitted a response for this poll");
    }
    doc.respondentId = userId;
  } else {
    const ipHash = hashIp(ip || "unknown");
    const existing = await Response.findOne({ pollId: poll._id, ipHash });
    if (existing) {
      throw ApiError.conflict("A response has already been recorded from this network");
    }
    doc.ipHash = ipHash;
  }

  try {
    return await Response.create(doc);
  } catch (err) {
    if (err && err.code === 11000) {
      throw ApiError.conflict("Duplicate response");
    }
    throw err;
  }
}
