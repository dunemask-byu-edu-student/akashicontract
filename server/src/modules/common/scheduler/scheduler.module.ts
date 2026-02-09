import { Global, Module } from "@nestjs/common";
import { BullMQModule } from "@akc/bullmq";
import { SchedulerService } from "./scheduler.service";
import { ScheduledTaskWorker } from "./scheduled-task.worker";
import { PostgresModule } from "@akc/postgres";

@Global()
@Module({
  imports: [PostgresModule, BullMQModule],
  providers: [SchedulerService, ScheduledTaskWorker],
  controllers: [],
  exports: [SchedulerService],
})
export class SchedulerModule {}
