import { MiddlewareConsumer, Module, NestModule, RequestMethod } from "@nestjs/common";
import { applyRawBodyOnlyTo } from "@akc/nest-extras";
import { EventEmitterModule } from "@nestjs/event-emitter";
import { ScheduleModule } from "@nestjs/schedule";

// Common Imports
import { PostgresModule } from "@akc/postgres";
import { VitalsModule } from "@akc/core/vitals/vitals.module";
import { CryptoModule } from "@akc/crypto";

// App Modules
import { ContractsModule } from "./modules/core/contracts/contracts.module";

// Modules
import { BullMQModule } from "@akc/bullmq";
import { SchedulerModule } from "@akc/scheduler";
import { ReactModule } from "@akc/core/react/react.module";

@Module({
  imports: [
    // Global Imports
    EventEmitterModule.forRoot(), // Enables Event emission, although we wrap this with the HooksService & HooksModule
    ScheduleModule.forRoot(), // Enables task scheduling

    // Common Modules
    PostgresModule,
    CryptoModule,
    BullMQModule,
    SchedulerModule,

    // Core Modules
    VitalsModule,

    // Modules
    ContractsModule,
    
    // Distribution Modules
    ReactModule, // Include this at the bottom as it handles redirects from root
  ],
  providers: [],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    applyRawBodyOnlyTo(
      consumer,
      { method: RequestMethod.GET, path: "/akashicontract/*path" },
      { method: RequestMethod.GET, path: "/akashicontract" },
    );
  }
}
