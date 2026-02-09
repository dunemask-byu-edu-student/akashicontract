import { Command } from "commander";

const program = new Command();

program
  .name("akcc")
  .description("Akashic Contract Client")
  .option("-c, --config <path>", "Path to config file")
  .option("-w, --watch", "Enable watch mode")
  .option("--init-config", "Initialize a default config file")
  .option("-b, --build <lang>", "Build the record for a specific language")
  .option("-p, --pull", "Pull the latest record for that refrence")
  .option("---production", "Run the client in production mode (fails to build ");

program.parse(process.argv);
const options = program.opts();

export function displayHelp() {
  program.help();
}

export function loadOptions() {
  // Assign envars from options

  // Loading Configuration Data
  process.env.AKC_CLIENT_INIT_CONFIG = `${+!!options.initConfig}`;
  process.env.AKC_CLIENT_CONFIG_PATH = options.config ?? "";

  // Binary Options
  process.env.AKC_CLIENT_PULL = `${+!!options.pull}`;
  process.env.AKC_CLIENT_WATCH_MODE = `${+!!options.watch}`;
  process.env.AKC_CLIENT_BUILD_LANG = options.buildLang ?? "";
  process.env.AKC_CLIENT_PRODUCTION_MODE = `${+!!options.production}`;
}
