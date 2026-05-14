import * as pollService from "./poll.services.js";
import ApiResponse from "../../common/utils/api-responses.js";

const createPoll = async (req, res) => {
  const poll = await pollService.createPoll(req.user.id, req.body);
  ApiResponse.created(res, "Poll created successfully.", poll);
};

const listMyPolls = async (req, res) => {
  const polls = await pollService.listPollsForCreator(req.user.id);
  ApiResponse.ok(res, "Polls retrieved successfully.", polls);
};

const getPollById = async (req, res) => {
  const poll = await pollService.getPollForOwner(req.params.pollId, req.user.id);
  ApiResponse.ok(res, "Poll retrieved successfully.", poll);
};

const updatePoll = async (req, res) => {
  const poll = await pollService.updatePollForOwner(
    req.params.pollId,
    req.user.id,
    req.body,
  );
  ApiResponse.ok(res, "Poll updated successfully.", poll);
};

const closePoll = async (req, res) => {
  const poll = await pollService.closePollForOwner(req.params.pollId, req.user.id);
  ApiResponse.ok(res, "Poll closed successfully.", poll);
};

const publishPoll = async (req, res) => {
  const poll = await pollService.publishPollForOwner(
    req.params.pollId,
    req.user.id,
  );
  ApiResponse.ok(res, "Poll results published successfully.", poll);
};

const getPublicPoll = async (req, res) => {
  const payload = await pollService.getPublicPollByShareToken(
    req.params.shareToken,
  );
  ApiResponse.ok(res, "Poll retrieved successfully.", payload);
};

const getPollAnalytics = async (req, res) => {
  const data = await pollService.getPollAnalyticsForOwner(
    req.params.pollId,
    req.user.id,
  );
  ApiResponse.ok(res, "Analytics retrieved successfully.", data);
};

export {
  createPoll,
  listMyPolls,
  getPollById,
  updatePoll,
  closePoll,
  publishPoll,
  getPublicPoll,
  getPollAnalytics,
};
