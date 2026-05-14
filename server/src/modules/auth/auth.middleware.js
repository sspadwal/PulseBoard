import ApiErrors from "../../common/utils/api-errors.js";
import { verifyAccessToken } from "../../common/utils/jwt.utils.js";
import User from "./auth.model.js";

const authenticate = async (req, res, next) => {
  let token;
  if (req.headers.authorization?.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    throw ApiErrors.unauthorized("Not Authenticated");
  }
  try {
    const decoded = verifyAccessToken(token);
    const user = await User.findById(decoded.id);
    if (!user) throw ApiErrors.unauthorized("User No Longer Exists");
    req.user = {
      id: user._id,
      name: user.name,
      email: user.email,
      // role: user.role,
    };
  } catch (error) {
    throw ApiErrors.unauthorized(error.message || "Invalid Token");
  }
  next();
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user?.role)) {
      throw ApiErrors.unauthorized(
        "You don't have the permission to Access it.",
      );
    }
    next();
  };
};

const optionalAuthenticate = async (req, res, next) => {
  let token;
  if (req.headers.authorization?.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1];
  }
  if (!token) {
    req.user = null;
    return next();
  }
  try {
    const decoded = verifyAccessToken(token);
    const user = await User.findById(decoded.id);
    req.user = user
      ? { id: user._id, name: user.name, email: user.email }
      : null;
  } catch {
    req.user = null;
  }
  next();
};

export { authenticate, authorize, optionalAuthenticate };
