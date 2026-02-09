import { CClientConfig, ClientConfig } from "@atlas/contracts";
import { LocaleCodes } from "@atlas/enums";
import fs from "node:fs";
import path from "node:path";
import { parse as yamlParse, stringify as yamlStringify } from "yaml";
type ConfigSchema = CClientConfig["ClientConfig"];

const optionEnvarMapping: Record<keyof ConfigSchema, string> = {
  recordInstance: "AKC_RECORD_INSTANCE",
  recordRef: "AKC_RECORD_REF",
  l10nCodes: "AKC_L10N_CODES",
  l10nPaths: "AKC_L10n_PATHS",
};

export function handleInitialConfigurationCommand() {
  // Knowing that the envars may have changed with option, we now can load the defaults
  const configFilePath = process.env["AKC_CLIENT_CONFIG_PATH"] || "akc.yaml";
  const initConfig = process.env["AKC_CLIENT_INIT_CONFIG"] === "1";
  const fullConfigPath = path.resolve(configFilePath);
  if (!initConfig) return loadConfigurationToEnvars(fullConfigPath);
  initializeDefaultConfiguration(fullConfigPath);
}

function loadConfigurationToEnvars(configPath: string) {
  const configuration = loadConfigurationFromFile(configPath);
  const configEntries = Object.entries(optionEnvarMapping) as Array<[keyof ConfigSchema, string]>;
  for (const [option, envar] of configEntries) {
    if (!!process.env[envar]) continue;
    process.env[envar] = Array.isArray(configuration[option]) ? configuration[option].join(",") : configuration[option];
  }
  process.env["AKC_CLIENT_CONFIG_PATH"] = configPath;
}

function loadConfigurationFromFile(configPath: string) {
  if (!fs.existsSync(configPath)) {
    console.error(`Could not find a configuration file at '${configPath}'`);
    console.error(`You can use akcc --init-config to create a default configuration file!`);
    process.exit(1);
  }
  const rawConfigText = fs.readFileSync(configPath, "utf8");
  try {
    const data = yamlParse(rawConfigText);
    return ClientConfig.ClientConfig.validateSync(data, {
      stripUnknown: true,
      strict: true,
      disableStackTrace: true,
      abortEarly: false,
    });
  } catch (err) {
    console.error(`Could not load the configuration file!`);
    console.error(err);
    process.exit(1);
  }
}

function initializeDefaultConfiguration(configPath: string) {
  fs.writeFileSync(configPath, yamlStringify(getDefaultConfig(), null, 2));
  process.exit(0);
}

export function getDefaultConfig(): ConfigSchema {
  return {
    recordInstance: "http://127.0.0.1",
    recordRef: "main",
    l10nCodes: [LocaleCodes.En],
    l10nPaths: ["*"],
  };
}
