import * as authService from "./auth.service.js";
import ApiResponse from "../../common/utils/api-responses.js";

const register = async (req, res) => {
  // something here preset.
  const user = await authService.register(req.body);
  ApiResponse.created(res, "User Register Successfully", user);
};

const login = async (req, res) => {
  const { user, accessToken, refreshToken } = await authService.login(req.body);
  res.cookie("accessToken", accessToken, {
    httpOnly: true,
    secure: true,
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: true,
    maxAge: 1 * 24 * 60 * 60 * 1000,
  });
  ApiResponse.ok(res, "User Login", { user, accessToken, refreshToken });
};

const logout = async (req, res) => {
  await authService.logout(req.user.id);
  // res.clearcookies("refreshToken")
  ApiResponse.ok(res, "Logout Success...");
};

const getMe = async (req, res) => {
  const user = await authService.getMe(req.user.id);
  ApiResponse.ok(res, "User Profile", user);
};

const refresh = async (req, res) => {
  const { accessToken, refreshToken } = await authService.refresh(
    req.cookies.refreshToken || req.body.refreshToken,
  );
  ApiResponse.ok(res, "token verified", { accessToken, refreshToken });
};

const forgotPass = async (req, res) => {
  await authService.forgotPassword(req.body.email);
  ApiResponse.ok(res, "forgot Password");
};

const resetPass = async (req, res) => {
  console.log(req.body);
  await authService.resetPassword(
    req.body.resetPasswordToken,
    req.body.password,
  );
  ApiResponse.ok(res, "password Reset");
};

const verifyUser = async (req, res) => {
  const user = await authService.verifyUser(req.params.id);
  ApiResponse.ok(res, "User Verified", user);
};

const greetHello = async (req, res) => {
  const msg = await authService.greetHello();
  ApiResponse.ok(res, msg);
};

const oidc = async (req, res) => {
  // Dynamically get the base URL (e.g., http://localhost:3000)
  const baseUrl = `${req.protocol}://${req.get("host")}`;

  return res.status(200).json({
    // The URL using the https scheme with no query or fragment component
    issuer: baseUrl,

    // URL of the OP's OAuth 2.0 Authorization Endpoint
    authorization_endpoint: `${baseUrl}/api/auth/login`,

    // URL of the OP's UserInfo Endpoint
    userinfo_endpoint: `${baseUrl}/api/auth/me`,

    // URL of the OP's JSON Web Key Set [JWK] document (where your public keys live)
    jwks_uri: `${baseUrl}/.well-known/jwks.json`,
  });
};

export {
  register,
  login,
  logout,
  getMe,
  refresh,
  forgotPass,
  resetPass,
  verifyUser,
  greetHello,
  oidc,
};
