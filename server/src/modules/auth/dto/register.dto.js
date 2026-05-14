import BaseDto from '../../../common/dto/base.dto.js'
import Joi from 'joi'
class RegisterDto extends BaseDto{
    static schema=Joi.object({
        name:Joi.string().trim().min(2).max(50).required(),
        email:Joi.string().email().lowercase().required(),
        password:Joi.string().min(8).max(100).message("Password must be 8 char minimum").required(),
        role:Joi.string().valid("customer","seller", "admin").default("customer")
    })
}

export default RegisterDto;