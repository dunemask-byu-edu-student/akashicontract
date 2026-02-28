import { Command } from "commander";
import { config } from "@config";

const program = new Command();

program
  .name("akcc")
  .description("Akashic Contract Client")
  .option("-c, --config <path>", "Path to config file")
  .option("-w, --watch", "Enable watch mode")
  .option("--init-config", "Initialize a default config file")
  .option("-p, --pull", "Pull the latest record for that reference")
  .option("--production", "Run the client in production mode");

program.parse(process.argv);
const options = program.opts();

export function loadOptions() {
  if (!!options.config) config.set("configPath", options.config);
  if (!!options.initConfig) config.set("initConfig", true);
  if (!!options.pull) config.set("pull", true);
  if (!!options.watch) config.set("watch", true);
  if (!!options.production) config.set("production", true);
}

export function displayHelp() {
  program.help();
}
