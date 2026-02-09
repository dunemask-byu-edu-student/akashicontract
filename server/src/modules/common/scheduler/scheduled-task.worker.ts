import { LOG } from "@akc/logging";
import { Processor } from "@nestjs/bullmq";
import {
  EventQueue,
  ScheduledTaskQueueName,
  BullmqRouterService,
  EventQueues,
  EventQueueWorker,
  EventQueueJob,
} from "@akc/bullmq";
import { PostgresService } from "@akc/postgres";
import * as y from "yup";

const safeJobProcessSchema = y.object({ scheduledTaskId: y.string().required() });
@Processor(ScheduledTaskQueueName)
export class ScheduledTaskWorker extends EventQueueWorker {
  constructor(
    private readonly _pgService: PostgresService,
    private readonly bullmqRouterService: BullmqRouterService,
  ) {
    super(safeJobProcessSchema);
  }

  async processJob(job: EventQueueJob<typeof safeJobProcessSchema>) {
    await this.processScheduled(job.data.scheduledTaskId);
  }

  private async processScheduled(scheduledTaskId: string) {
    const scheduledTask = await this._pgService.scheduledTask.findUnique({ where: { id: scheduledTaskId } });
    if (!scheduledTask) return LOG.warnTag("SCHEDULED TASK WORKER", `Event '${scheduledTaskId}' missing!`);
    await this._pgService.scheduledTask.delete({ where: { id: scheduledTaskId } });
    const eventQueue = scheduledTask.queue as EventQueue;
    if (!Object.values(EventQueues).includes(eventQueue)) return LOG.warnTag("SCHEDULED TASK WORKER", "Bad queue");
    const eventData = scheduledTask.data;
    LOG.sillyTag(
      "SCHEDULED TASK WORKER",
      `\nQueue: ${eventQueue}\nJob: ${scheduledTaskId}\nData: \n${JSON.stringify(eventData, null, 2)}`,
    );
    await this.bullmqRouterService.addJob(eventQueue, scheduledTask.id, eventData);
  }
}
