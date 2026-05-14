import mongoose from "mongoose";
import Poll from "./poll.model.js";
import Response from "../responses/responses.model.js";
import ApiError from "../../common/utils/api-errors.js";

function attachQuestionOptionOrder(questions) {
  return questions.map((q, qi) => ({
    ...q,
    order: q.order ?? qi,
    options: (q.options || []).map((o, oi) => ({
      ...o,
      order: o.order ?? oi,
    })),
  }));
}

export async function createPoll(userId, payload) {
  const doc = await Poll.create({
    createdBy: userId,
    title: payload.title,
    description: payload.description ?? "",
    isAnonymous: payload.isAnonymous ?? false,
    expiresAt: payload.expiresAt,
    status: payload.status ?? "active",
    questions: attachQuestionOptionOrder(payload.questions),
  });
  return doc;
}

export async function listPollsForCreator(userId) {
  return Poll.find({ createdBy: userId }).sort({ createdAt: -1 });
}

export async function getPollForOwner(pollId, userId) {
  if (!mongoose.isValidObjectId(pollId)) {
    throw ApiError.badRequest("Invalid poll id");
  }
  const poll = await Poll.findOne({ _id: pollId, createdBy: userId });
  if (!poll) throw ApiError.notfound("Poll not found");
  return poll;
}

export async function updatePollForOwner(pollId, userId, payload) {
  const poll = await getPollForOwner(pollId, userId);
  if (poll.status === "published") {
    throw ApiError.badRequest("Published polls cannot be edited");
  }
  if (payload.expiresAt && new Date(payload.expiresAt) <= new Date()) {
    throw ApiError.badRequest("Expiry date must be in the future");
  }
  if (payload.questions) {
    const responseCount = await Response.countDocuments({ pollId: poll._id });
    if (responseCount > 0) {
      throw ApiError.badRequest(
        "Cannot change questions after responses have been collected",
      );
    }
    poll.questions = attachQuestionOptionOrder(payload.questions);
  }
  const fields = ["title", "description", "isAnonymous", "expiresAt", "status"];
  for (const key of fields) {
    if (payload[key] !== undefined) poll[key] = payload[key];
  }
  await poll.save();
  return poll;
}

export async function closePollForOwner(pollId, userId) {
  const poll = await getPollForOwner(pollId, userId);
  if (poll.status === "published") {
    throw ApiError.badRequest("Poll is already published");
  }
  poll.status = "closed";
  await poll.save();
  return poll;
}

export async function publishPollForOwner(pollId, userId) {
  const poll = await getPollForOwner(pollId, userId);
  if (!["active", "closed"].includes(poll.status)) {
    throw ApiError.badRequest("Only active or closed polls can be published");
  }
  poll.status = "published";
  await poll.save();
  return poll;
}

function serializeQuestion(q) {
  return {
    _id: q._id,
    text: q.text,
    order: q.order,
    isMandatory: q.isMandatory,
    options: (q.options || []).map((o) => ({
      _id: o._id,
      text: o.text,
      order: o.order,
    })),
  };
}

export async function getPublicPollByShareToken(shareToken) {
  const poll = await Poll.findOne({ shareToken });
  if (!poll) throw ApiError.notfound("Poll not found");
  if (poll.status === "draft") {
    throw ApiError.notfound("Poll not found");
  }
  const expired = poll.isExpired();
  const accepting = poll.isAcceptingResponses();
  const base = {
    title: poll.title,
    description: poll.description,
    isAnonymous: poll.isAnonymous,
    expiresAt: poll.expiresAt,
    status: poll.status,
    shareToken: poll.shareToken,
    createdAt: poll.createdAt,
  };
  if (poll.status === "published") {
    const analytics = await buildAnalytics(poll);
    return {
      poll: base,
      flags: {
        acceptingResponses: false,
        showResults: true,
        expired,
      },
      questions: poll.questions.map(serializeQuestion),
      analytics,
    };
  }
  return {
    poll: base,
    flags: {
      acceptingResponses: accepting,
      showResults: false,
      expired,
    },
    questions: poll.questions.map(serializeQuestion),
    analytics: null,
  };
}

async function aggregateOptionCounts(pollId) {
  const pid = new mongoose.Types.ObjectId(pollId);
  return Response.aggregate([
    { $match: { pollId: pid } },
    { $unwind: "$answers" },
    {
      $group: {
        _id: {
          questionId: "$answers.questionId",
          optionId: "$answers.selectedOptionId",
        },
        count: { $sum: 1 },
      },
    },
  ]);
}

function countMap(rows) {
  const map = new Map();
  for (const row of rows) {
    const qid = String(row._id.questionId);
    const oid = String(row._id.optionId);
    if (!map.has(qid)) map.set(qid, new Map());
    map.get(qid).set(oid, row.count);
  }
  return map;
}

export async function buildAnalytics(poll) {
  const totalResponses = await Response.countDocuments({ pollId: poll._id });
  const rows = await aggregateOptionCounts(poll._id);
  const byQuestion = countMap(rows);

  const participation = poll.isAnonymous
    ? { mode: "anonymous", totalResponses }
    : {
        mode: "authenticated",
        totalResponses,
        responsesWithAccount: await Response.countDocuments({
          pollId: poll._id,
          respondentId: { $exists: true, $ne: null },
        }),
      };

  const questions = [];
  for (const q of poll.questions) {
    const optCounts = byQuestion.get(String(q._id)) || new Map();
    const optionStats = q.options.map((o) => ({
      optionId: o._id,
      text: o.text,
      order: o.order,
      count: optCounts.get(String(o._id)) || 0,
    }));
    const answeredForQuestion = [...optCounts.values()].reduce(
      (a, b) => a + b,
      0,
    );
    questions.push({
      questionId: q._id,
      text: q.text,
      order: q.order,
      isMandatory: q.isMandatory,
      answeredCount: answeredForQuestion,
      optionStats,
    });
  }

  return {
    totalResponses,
    participation,
    questions,
  };
}

export async function getPollAnalyticsForOwner(pollId, userId) {
  const poll = await getPollForOwner(pollId, userId);
  const analytics = await buildAnalytics(poll);
  return { poll, analytics };
}
