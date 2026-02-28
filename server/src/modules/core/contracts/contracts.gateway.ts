import { WebSocketGateway, WebSocketServer, SubscribeMessage, OnGatewayConnection } from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import { ContractsService } from "./contracts.service";
import { Contract } from "src/atlas/contracts/assets/contract.models";

const MAX_CONTRACTS_INIT = 1000;

@WebSocketGateway({ cors: { origin: "*" } })
export class ContractsGateway implements OnGatewayConnection {
  
  @WebSocketServer()
  server!: Server;

  constructor(private readonly contractsService: ContractsService) {}

  async handleConnection(client: Socket) {
    const userId = "1" // Hardcoded until auth logic is implemented 
    if (userId) {
      const contracts = await this.contractsService.getContracts(userId, 1, MAX_CONTRACTS_INIT);
      client.emit("contracts.init", { data: contracts });
    }
  }

  @SubscribeMessage("client.healthy")
  handleClientHealthy() {
    return { status: "ok" };
  }

  sendContractSet(contract: Contract) {
    this.server.emit("contract.set", { data: contract });
  }

  sendContractDelete(id: string) {
    this.server.emit("contract.del", { id }) 
  }
}