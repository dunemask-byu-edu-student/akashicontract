import CONFIG from "@akc/config";
import { LOG } from "@akc/logging";
import { Injectable, OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

@Injectable()
export class PostgresService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor() {
    const adapter = new PrismaPg({ connectionString: CONFIG.ENV.POSTGRES_CONNECTION_URI });
    super({ errorFormat: "pretty", log: ["warn", "error"], adapter });
  }

  async onModuleInit() {
    LOG.warn("POSTGRES", "Database server currently not connected!");
    // await this.$connect();
  }

  async onModuleDestroy() {
    // await this.$disconnect();
  }
}
