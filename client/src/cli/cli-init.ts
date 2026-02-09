import { loadOptions } from "@cli/cli-args";
import { handleConfigErrors } from "@cli/cli-errors";
import { handleInitialConfigurationCommand } from "@cli/cli-config";
import { loadConfig } from "@config";

export function intialize() {
  loadOptions(); // Load CLI Options
  handleInitialConfigurationCommand(); // Handle Configuration FIle
  loadConfig(); // Handle CONFIG setup
  handleConfigErrors(); // Handle Full Configuration mismatch errors
}
