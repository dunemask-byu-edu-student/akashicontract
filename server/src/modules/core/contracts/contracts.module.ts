import { Module } from "@nestjs/common";
import { ContractsService } from "./contracts.service";
import { ContractsController } from "./contracts.controller";
import { ContractsGateway } from "./contracts.gateway";
import { ContractsSocketService } from "./contracts-sockets.service";

@Module({
  imports: [],
  controllers: [ContractsController],
  providers: [ContractsService, ContractsGateway, ContractsSocketService],
  exports: [ContractsService],
})
export class ContractsModule {}
