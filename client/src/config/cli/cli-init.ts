import { loadOptions } from "@cli/cli-args";
import { handleInitialConfigurationCommand } from "@cli/cli-config";
import { config } from "@config";
import { getGeneratorClass } from "../../generators";
import { ObjectAttribute } from "@atlas/enums";
import { SocketManager } from "../../sockets/SocketManager";

export function initialize() {
  loadOptions(); // 1️⃣ Load CLI args into config
  handleInitialConfigurationCommand(); // 2️⃣ Load YAML into config
  config.lock(); // 3️⃣ Lock + validate everything
  new SocketManager().connect();

  // // 4️⃣ Run application
  // for (const entry of CONFIG.BUILDER.OUTPUT_CONFIG) {
  //   const generatorClass = getGeneratorClass(entry.lang);
  //   const generator = new generatorClass(entry.dir);

  //   generator.generateContracts([
  //     {
  //       id: "User",
  //       userId: "1",
  //       name: "User",
  //       attributes: {
  //         name: ObjectAttribute.STRING,
  //         email: ObjectAttribute.STRING,
  //         isAdmin: ObjectAttribute.BOOLEAN,
  //         age: ObjectAttribute.NUMBER,
  //       },
  //     },
  //   ]);
  // }
}
