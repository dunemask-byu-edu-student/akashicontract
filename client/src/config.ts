// Required Envar Checks
const REQUIRED_ENVARS = [
  // Loading Configuration Data
  "AKC_CLIENT_INIT_CONFIG", // Boolean to initialize the config
  "AKC_CLIENT_CONFIG_PATH", // Path to the config

  // Binary Options
  "AKC_CLIENT_PULL", // Pull changes from the server
  "AKC_CLIENT_WATCH_MODE", // Watch for changes from the server and reload
  "AKC_CLIENT_PRODUCTION_MODE", // Production mode

  // Config Options
  "AKC_RECORD_INSTANCE", // Server Instance for AKC
  "AKC_RECORD_REF", // Reference for the data to pull
] as const;

declare type Envars = {
  [key in (typeof REQUIRED_ENVARS)[number]]: string;
} & Record<string, string | null>;

function processConfig(skipErrors = false) {
  const ENV = process.env as Envars;
  const missingEnvars = REQUIRED_ENVARS.filter((envar) => !ENV[envar]);
  if (missingEnvars.length > 0 && !skipErrors)
    throw new Error(`Missing Envars ${JSON.stringify(missingEnvars, null, 2)}`);

  return {
    LOG_LEVEL: parseInt(ENV.LOG_LEVEL ?? "30", 10),
    ENV,
    SYNCING: {
      AKC_RECORD_REF: ENV.AKC_RECORD_REF,
      AKC_RECORD_INSTANCE: ENV.AKC_RECORD_INSTANCE,
      PERFORM_SYNC: ENV.AKC_CLIENT_PULL === "1",
      PERFORM_WATCH: ENV.AKC_CLIENT_WATCH_MODE === "1",
    },
    BUILDER: {
      PRODUCTION_MODE: ENV.AKC_CLIENT_PRODUCTION_MODE === "1",
      BUILD_LANG_ENVAR: ENV.AKC_CLIENT_BUILD_LANG,
    },
  };
}

// Internal cached config stored in a const object
const configCache = { value: processConfig(true) };

// Explicitly reload the cached config
export const loadConfig = () => (configCache.value = processConfig());

const CONFIG = new Proxy(configCache.value, {
  get(_, prop) {
    return configCache.value[prop as keyof typeof configCache.value];
  },
});

export default CONFIG;
