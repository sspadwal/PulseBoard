import BaseDto from '../../../common/dto/base.dto.js'
import Joi from 'joi'
class ResetPassDto extends BaseDto{
    static schema=Joi.object({
        resetPasswordToken:Joi.string().required(),
        password:Joi.string().required()
    })
}

export default ResetPassDto;