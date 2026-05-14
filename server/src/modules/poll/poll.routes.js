import { Router } from "express";
import { authenticate } from "../auth/auth.middleware.js";
import validate from "../../common/middleware/validate.middleware.js";
import CreatePollDto from "./dto/create-poll.dto.js";
import UpdatePollDto from "./dto/update-poll.dto.js";
import * as controller from "./poll.controller.js";

const router = Router();

router.get("/public/:shareToken", controller.getPublicPoll);

router.post("/", authenticate, validate(CreatePollDto), controller.createPoll);
router.get("/mine", authenticate, controller.listMyPolls);

router.get(
  "/:pollId/analytics",
  authenticate,
  controller.getPollAnalytics,
);
router.post("/:pollId/close", authenticate, controller.closePoll);
router.post("/:pollId/publish", authenticate, controller.publishPoll);
router.get("/:pollId", authenticate, controller.getPollById);
router.patch(
  "/:pollId",
  authenticate,
  validate(UpdatePollDto),
  controller.updatePoll,
);

export default router;
