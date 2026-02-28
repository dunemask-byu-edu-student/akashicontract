import { loadOptions } from "@cli/cli-args";
import { handleInitialConfigurationCommand } from "@cli/cli-config";
import { config } from "@config";
import { SocketManager } from "../../sockets/SocketManager";

export function initialize() {
  loadOptions(); // 1️⃣ Load CLI args into config
  handleInitialConfigurationCommand(); // 2️⃣ Load YAML into config
  config.lock(); // 3️⃣ Lock + validate everything
  new SocketManager().connect(); // 4️⃣ Connect + handle contract events
}
