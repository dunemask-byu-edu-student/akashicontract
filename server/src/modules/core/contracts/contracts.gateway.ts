import { WebSocketGateway, WebSocketServer, SubscribeMessage } from "@nestjs/websockets";
import { Server } from "socket.io";
import { Contract } from "src/atlas/contracts/assets/contract.models";

@WebSocketGateway({ cors: { origin: "*" } })
export class ContractsGateway {
  
  @WebSocketServer()
  server!: Server;

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