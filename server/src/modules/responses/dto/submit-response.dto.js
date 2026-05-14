import BaseDto from "../../../common/dto/base.dto.js";
import Joi from "joi";

class SubmitResponseDto extends BaseDto {
  static schema = Joi.object({
    answers: Joi.array()
      .items(
        Joi.object({
          questionId: Joi.string().hex().length(24).required(),
          selectedOptionId: Joi.string().hex().length(24).required(),
        }),
      )
      .min(1)
      .required(),
  });
}

export default SubmitResponseDto;
