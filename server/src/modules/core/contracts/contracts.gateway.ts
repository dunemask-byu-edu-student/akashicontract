import { WebSocketGateway } from "@nestjs/websockets/decorators/socket-gateway.decorator";

@WebSocketGateway()
export class ContractsGateway {
  constructor() {}
}