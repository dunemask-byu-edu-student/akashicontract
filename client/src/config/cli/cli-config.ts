import fs from "node:fs";
import path from "node:path";
import { parse as yamlParse, stringify as yamlStringify } from "yaml";
import { LocaleCodes } from "@atlas/enums";
import { CClientConfig } from "@atlas/contracts";
import { config } from "../config";

export function getDefaultConfig(): CClientConfig["ClientConfig"] {
  return {
    recordInstance: "http://127.0.0.1",
    recordRef: "main",
    l10nCodes: [LocaleCodes.En],
    l10nPaths: ["*"],
    output: [],
  };
}

export function handleInitialConfigurationCommand() {
  const configPath = path.resolve(config.get("configPath"));
  const initConfig = config.get("initConfig");

  if (initConfig) {
    fs.writeFileSync(configPath, yamlStringify(getDefaultConfig()));
    process.exit(0);
  }

  if (!fs.existsSync(configPath)) {
    console.error(`Could not find configuration at '${configPath}'`);
    process.exit(1);
  }

  const raw = fs.readFileSync(configPath, "utf8");
  const parsed = yamlParse(raw);

  config.loadValidatedClientConfig(parsed);
}
