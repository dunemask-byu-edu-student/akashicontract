import { Module } from "@nestjs/common";
import { ContractsService } from "./contracts.service";
import { ContractsController } from "./contracts.controller";
import { ContractsGateway } from "./contracts.gateway";
import { PostgresService } from "@akc/modules/common/postgres/postgres.service";

@Module({
  imports: [],
  controllers: [ContractsController],
  providers: [ContractsService, ContractsGateway, PostgresService],
  exports: [ContractsService],
})
export class ContractsModule {}