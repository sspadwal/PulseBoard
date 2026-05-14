import crypto from 'crypto'
import jwt from 'jsonwebtoken'
const generateResetToken=()=>{
    const rawToken = crypto.randomBytes(32).toString("hex")
    const hashToken = crypto.createHash("sha256").update(rawToken).digest("hex")

    return {rawToken,hashToken}
}

const generateAccessToken=(payload)=>{
    return jwt.sign(payload,process.env.JWT_ACCESS_SECRET,{
        expiresIn:process.env.JWT_ACCESS_EXPIRES_IN || "15m"
    })
}

const verifyAccessToken=(token)=>{
    return jwt.verify(token,process.env.JWT_ACCESS_SECRET)
}

const generateRefreshToken=(payload)=>{
    return jwt.sign(payload,process.env.JWT_REFRESH_SECRET,{
        expiresIn:process.env.JWT_REFRESH_EXPIRES_IN || "7d"
    })
}

const verifyRefreshToken=(token)=>{
    return jwt.verify(token,process.env.JWT_REFRESH_SECRET)
}

export {
    generateResetToken,
    generateAccessToken,
    generateRefreshToken,
    verifyAccessToken,
    verifyRefreshToken
}