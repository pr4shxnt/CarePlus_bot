export interface AppConfig {
  port: number;
  mongoUri: string;
  jwtSecret: string;
  jwtExpiresIn: string;
  botApiKey: string;
  nodeEnv: string;
  corsOrigins: string[];
}

function requireEnv(key: string): string {
  const val = process.env[key];
  if (!val) throw new Error(`Missing required environment variable: ${key}`);
  return val;
}

export function loadConfig(): AppConfig {
  return {
    port: parseInt(process.env.PORT || "4000", 10),
    mongoUri: process.env.MONGO_URI || "mongodb://localhost:27017/jarvis",
    jwtSecret: process.env.JWT_SECRET || "CHANGE_THIS_IN_PRODUCTION_32CHAR_MIN",
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || "7d",
    botApiKey: requireEnv("BOT_API_KEY"),
    nodeEnv: process.env.NODE_ENV || "development",
    corsOrigins: (process.env.CORS_ORIGINS || "http://localhost:3000").split(","),
  };
}
