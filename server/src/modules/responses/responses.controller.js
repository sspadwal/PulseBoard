import * as responsesService from "./responses.service.js";
import ApiResponse from "../../common/utils/api-responses.js";

const submitResponse = async (req, res) => {
  const ip = req.ip || req.socket?.remoteAddress || "";
  const response = await responsesService.submitResponseByShareToken(
    req.params.shareToken,
    req.body,
    { userId: req.user?.id ?? null, ip },
  );
  ApiResponse.created(res, "Response submitted successfully.", response);
};

export { submitResponse };
