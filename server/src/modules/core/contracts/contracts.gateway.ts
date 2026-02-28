import { WebSocketGateway, WebSocketServer, SubscribeMessage, OnGatewayConnection } from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import { ContractsService } from "./contracts.service";
import { ContractsSocketService } from "./contracts-sockets.service";

const MAX_CONTRACTS_INIT = 1000;

@WebSocketGateway({ cors: { origin: "*" } })
export class ContractsGateway implements OnGatewayConnection {
  @WebSocketServer()
  server!: Server;

  constructor(
    private readonly contractsService: ContractsService,
    private readonly socketService: ContractsSocketService, // Inject middleman
  ) {}

  // This runs when the socket server starts
  afterInit(server: Server) {
    this.socketService.server = server; // Pass the server to the service
  }

  async handleConnection(client: Socket) {
    const userId = "1"; // Hardcoded until auth logic is implemented
    const contracts = await this.contractsService.getContracts(userId, 1, MAX_CONTRACTS_INIT);
    client.emit("contracts.init", { data: contracts });
  }

  @SubscribeMessage("client.healthy")
  handleClientHealthy() {
    return { status: "ok" };
  }
}
