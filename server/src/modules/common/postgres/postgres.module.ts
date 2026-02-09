import { Global, Module } from "@nestjs/common";
import { PostgresService } from "./postgres.service";

@Global()
@Module({
  exports: [PostgresService],
  providers: [PostgresService],
})
export class PostgresModule {}
