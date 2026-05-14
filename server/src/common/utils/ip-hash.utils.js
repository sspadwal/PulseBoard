import crypto from "crypto";

export function hashIp(ip) {
  const salt = process.env.IP_HASH_SALT || "poll-ip-salt-change-in-prod";
  return crypto.createHash("sha256").update(`${salt}:${ip}`).digest("hex");
}
