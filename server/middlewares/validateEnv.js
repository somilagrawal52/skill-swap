const validateEnv = () => {
  const required = ["MONGO_URI", "JWT_SECRET"];
  const missing = required.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    console.error(`\x1b[31m[CRITICAL CONFIG ERROR] Missing required environment variable(s): ${missing.join(", ")}\x1b[0m`);
    process.exit(1);
  }

  if (process.env.JWT_SECRET.length < 16) {
    console.warn("\x1b[33m[SECURITY WARNING] JWT_SECRET is short (<16 chars). Consider using a stronger secret key in production.\x1b[0m");
  }
};

module.exports = validateEnv;
