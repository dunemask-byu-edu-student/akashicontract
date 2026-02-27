import { WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { Server } from "socket.io";
import { Contract } from "src/atlas/contracts/assets/contract.models";

@WebSocketGateway({ cors: { origin: "*" } })
export class ContractsGateway {
  
  @WebSocketServer()
  server!: Server;

  sendContractSet(contract: Contract) {
    this.server.emit("contract.set", { id: contract.id, data: contract });
  }

  sendContractDelete(id: string) {
    this.server.emit("contract.del", { id }) 
  }
}