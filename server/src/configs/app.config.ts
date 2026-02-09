import { jsonPost } from "@akc/util";
import { DEFAULT_POLICY_MAP } from "./auth-policies.config";

// Required Envar Checks
const REQUIRED_ENVARS = [
  // General
  "APPLICATION_ENV", // Used to determine production or not
  "POSTGRES_CONNECTION_URI", // Used to connect to the postgres database
  "REDIS_CONNECTION_URI", // Used to connect socketio streams
  // Crypto
  "CRYPTO_INITIAL_VECTOR", // Used to encrypt data
  "CRYPTO_SECRET_KEY", // Used to encrypt data
] as const;

const missingEnvars: string[] = REQUIRED_ENVARS.filter((envar) => !process.env[envar]);
declare type Envars = { [key in (typeof REQUIRED_ENVARS)[number]]: string } & Record<string, string | null>;
const ENV = process.env as Envars;

const CONFIG = {
  APPLICATION_ENV: ENV.APPLICATION_ENV as "production" | "staging" | "local",
  LOG_LEVEL: parseInt(ENV.LOG_LEVEL ?? "30"),
  ENV: ENV,
  PORT: Number(ENV.PORT ?? "52000"),
  CRYPTO: {
    ENCRYPTION_INITIAL_VECTOR: ENV.CRYPTO_INITIAL_VECTOR,
    ENCRYPTION_METHOD: ENV.CRYPTO_METHOD ?? "aes-256-cbc",
    ENCRYPTION_SECRET_KEY: ENV.CRYPTO_SECRET_KEY,
    RUNNER_TOKEN_EXPIRY: 315_360_000, // 10 years in seconds
  },
  AUTH_POLICY: DEFAULT_POLICY_MAP,
};
export default CONFIG;

if (missingEnvars.length > 0 && ENV.APPLICATION_ENV !== "production")
  throw Error(`Missing Envars ${JSON.stringify(missingEnvars, null, 2)}`);
if (missingEnvars.length > 0)
  jsonPost("https://hooks.slack.com/services/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", {
    text: `LAUNCHBOARD MISSING ENVARS!\n${missingEnvars.map((envar) => `\`${envar}\``).join("\n")}`,
  });
