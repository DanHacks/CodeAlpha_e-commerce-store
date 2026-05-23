export const env = {
  PORT: process.env.PORT ? Number(process.env.PORT) : 8081,
  JWT_SECRET: process.env.JWT_SECRET || "dev_jwt_secret_change_me",
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || "dev_refresh_secret_change_me",
  ADMIN_EMAIL: (process.env.ADMIN_EMAIL || "hydan@codealpha.com").toLowerCase(),
  ADMIN_PASSWORD: process.env.ADMIN_PASSWORD || "CodeAlpha@Admin",
};

