import { Router } from "express";
import { optionalAuthenticate } from "../auth/auth.middleware.js";
import validate from "../../common/middleware/validate.middleware.js";
import SubmitResponseDto from "./dto/submit-response.dto.js";
import * as controller from "./responses.controller.js";

const router = Router();

router.post(
  "/:shareToken",
  optionalAuthenticate,
  validate(SubmitResponseDto),
  controller.submitResponse,
);

export default router;
