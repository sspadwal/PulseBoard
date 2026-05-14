import BaseDto from "../../../common/dto/base.dto.js";
import Joi from "joi";

const optionSchema = Joi.object({
  text: Joi.string().trim().min(1).max(200).required(),
  order: Joi.number().integer().min(0).optional(),
});

const questionSchema = Joi.object({
  text: Joi.string().trim().min(1).max(500).required(),
  order: Joi.number().integer().min(0).optional(),
  isMandatory: Joi.boolean().optional(),
  options: Joi.array().items(optionSchema).min(2).required(),
});

class UpdatePollDto extends BaseDto {
  static schema = Joi.object({
    title: Joi.string().trim().min(1).max(150).optional(),
    description: Joi.string().trim().max(1000).allow("").optional(),
    isAnonymous: Joi.boolean().optional(),
    expiresAt: Joi.date().optional(),
    status: Joi.string().valid("draft", "active", "closed").optional(),
    questions: Joi.array().items(questionSchema).min(1).optional(),
  }).min(1);
}

export default UpdatePollDto;
