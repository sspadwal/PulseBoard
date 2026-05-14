import {Router} from 'express'
import * as controller from '../auth/auth.controller.js'
import validate from '../../common/middleware/validate.middleware.js'
import {RegisterDto,LoginDto,RefreshDto,ResetPassDto,ForgotPassDto} from './dto/index.js'
// import RegisterDto from './dto/register.dto.js';
import { authenticate} from './auth.middleware.js';
// import { Joi } from 'joi';
 const router = Router();
router.get('/',controller.greetHello)
router.post('/register', validate(RegisterDto),controller.register)
router.post('/login',validate(LoginDto),controller.login)
router.post('/refresh',validate(RefreshDto),controller.refresh)
router.get('/me',authenticate,controller.getMe)
router.post('/logout',authenticate,controller.logout)
router.get('/verify-user/:id', controller.verifyUser)
router.post('/forgot-password', validate(ForgotPassDto), controller.forgotPass)
router.post('/reset-password', validate(ResetPassDto), controller.resetPass)
router.get('/.well-known/openid-configuration',controller.oidc)

export default router;