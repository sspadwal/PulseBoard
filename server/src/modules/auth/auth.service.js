import crypto from "crypto";
import ApiError from "../../common/utils/api-errors.js";
import {
  generateResetToken,
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from "../../common/utils/jwt.utils.js";
import User from "../auth/auth.model.js";
import { sendEmail } from "../../common/config/email.js";

const hashToken = (token) => crypto.createHash("sha256").update(token).digest("hex");

const register = async ({ name, email, password, role }) => {
  const existing = await User.findOne({ email });
  if (existing) {
    throw ApiError.conflict("Email Already Exists");
  }
  const user = await User.create({
    name,
    email,
    password,
    role,
    isVerified: true,
  });

  const userObj = user.toObject();
  delete userObj.password;
  return userObj;
};

const login = async ({ email, password }) => {
  const user = await User.findOne({ email }).select("+password");
  if (!user) {
    throw ApiError.unauthorized("Unauthorized user");
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    throw ApiError.unauthorized("Invalid Email or Password.");
  }

  const accessToken = generateAccessToken({ id: user._id, role: user.role });
  const refreshToken = generateRefreshToken({ id: user._id });
  user.refreshToken = hashToken(refreshToken);
  await user.save({ validateBeforeSave: false });

  const userObj = user.toObject();
  delete userObj.password;
  delete userObj.refreshToken;
  return { user: userObj, refreshToken, accessToken };
};

const refresh = async (token) => {
  if (!token) {
    throw ApiError.unauthorized("Unauthorized User");
  }

  const decoded = verifyRefreshToken(token);
  const user = await User.findById(decoded.id).select("+refreshToken");
  if (user.refreshToken !== hashToken(token)) {
    throw ApiError.unauthorized("Invalid Refresh Token");
  }

  const accessToken = generateAccessToken({ id: user._id, role: user.role });
  const refreshToken = generateRefreshToken({ id: user._id });

  user.refreshToken = hashToken(refreshToken);
  await user.save({ validateBeforeSave: false });

  const userObj = user.toObject();
  delete userObj.password;
  delete userObj.refreshToken;

  return { accessToken, refreshToken };
};

const logout = async (userId) => {
  await User.findByIdAndUpdate(userId, {
    refreshToken: null,
  });
};

const forgotPassword = async (email) => {
  const user = await User.findOne({ email });
  if (!user) {
    throw ApiError.notfound("No account with that email.");
  }
  const { rawToken, hashToken: resetHash } = generateResetToken();
  user.resetPasswordToken = resetHash;
  user.resetPasswordExpires = Date.now() + 15 * 60 * 1000;

  await user.save();
  try {
    await sendEmail({
      to: email,
      subject: "Reset your Password",
      text: `You requested a password reset. Please use this token to reset your password: ${rawToken}`,
      html: `<h1>Password Reset</h1><p>You requested a password reset.</p><p>Please use this token to reset your password: <strong>${rawToken}</strong></p>`,
    });
  } catch (error) {
    console.error("Mail Sending Failed", error);
  }
};

const resetPassword = async (resetPasswordToken, newPassword) => {
  const hashrawToken = hashToken(resetPasswordToken);
  const user = await User.findOne({ resetPasswordToken: hashrawToken }).select("+password");
  if (!user) {
    throw ApiError.notfound("Invalid token");
  }
  user.password = newPassword;
  await user.save({ validateBeforeSave: false });
};

const getMe = async (userId) => {
  const user = await User.findById(userId);
  if (!user) throw ApiError.notfound("User not Found");
  return user;
};

const greetHello = async () => "hello";

export {
  register,
  login,
  logout,
  refresh,
  forgotPassword,
  resetPassword,
  getMe,
  greetHello,
};
