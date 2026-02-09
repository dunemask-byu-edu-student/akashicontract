import { LOG } from "@akc/logging";
import { BullModule, RegisterQueueOptions } from "@nestjs/bullmq";
import { Global, Module, OnModuleInit } from "@nestjs/common";
import { BullmqRouterService } from "./bullmq-router.service";
import { EventQueues, ScheduledTaskQueueName } from "./queues";
import CONFIG from "@akc/config";

const queueConfigs: RegisterQueueOptions[] = Object.values(EventQueues).map((eventQueue) => ({ name: eventQueue }));

@Global()
@Module({
  imports: [
    BullModule.forRoot({ connection: { url: CONFIG.ENV.REDIS_CONNECTION_URI } }),
    BullModule.registerQueue(...queueConfigs),
    BullModule.registerQueue({ name: ScheduledTaskQueueName }),
  ],
  providers: [BullmqRouterService],
  controllers: [],
  exports: [BullmqRouterService],
})
export class BullMQModule implements OnModuleInit {
  onModuleInit = () => LOG.infoTag("BULLMQ", "Queues Registered!");
}
