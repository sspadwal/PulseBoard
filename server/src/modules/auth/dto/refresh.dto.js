import BaseDto from '../../../common/dto/base.dto.js'
import Joi from 'joi'

class RefreshDto extends BaseDto{
    static schema=Joi.object({
        token:Joi.string().required(),
    })
}

export default RefreshDto;