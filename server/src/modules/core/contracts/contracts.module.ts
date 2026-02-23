import { Module } from "@nestjs/common";
import { ContractsService } from "./contracts.service";
import { ContractsController } from "./contracts.controller";
import { ContractsGateway } from "./contracts.gateway";

@Module({
  imports: [],
  controllers: [ContractsController],
  providers: [ContractsService, ContractsGateway],
  exports: [ContractsService],
})
export class ContractsModule {}