import { Server } from "socket.io";
import { CObjectDefinition } from "@atlas/contracts";
import { Injectable } from "@nestjs/common";

@Injectable()
export class ContractsSocketService {
  public server!: Server;

  sendContractSet(contract: CObjectDefinition["ObjectDefinition"]) {
    this.server.emit("contract.set", { data: contract });
  }

  sendContractDelete(id: string) {
    this.server.emit("contract.del", { id });
  }

  async sendInitContracts(contracts: CObjectDefinition["ObjectDefinition"][]) {
    this.server.emit("contracts.init", { data: contracts });
  }
}
