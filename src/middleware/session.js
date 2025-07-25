const cookieSession = require("cookie-session");

const configureSession = () => {
  return cookieSession({
    name: "session",
    keys: [process.env.SESSION_SECRET || "default_secret"],
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    secure: process.env.NODE_ENV === "production", // HTTPS in production
    httpOnly: true,
    sameSite: "lax",
  });
};

module.exports = { configureSession };
