import { Injectable } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { JobsOptions } from "bullmq";
import moment, { Moment } from "moment";
import { BullmqRouterService, EventQueue } from "@akc/bullmq";
import { PostgresService } from "@akc/postgres";
import { randomSlug } from "@akc/util";

const MIN_SCHEDULE_DELAY = 10;

export namespace Scheduler {
  export interface Job {
    queue: EventQueue;
    data: Prisma.InputJsonValue;
    kind?: string;
    jobName?: string;
  }
  export interface ScheduledJob {
    queue: EventQueue;
    data: Prisma.InputJsonValue;
    appId?: string;
    kind?: string;
    executeAt: Moment;
  }
}

@Injectable()
export class SchedulerService {
  constructor(
    private readonly _pgService: PostgresService,
    private readonly bullMqRouterService: BullmqRouterService,
  ) {}

  /**
   * Launch a job immediately into a specific queue
   * @param job JobData to launch
   * @param opts BullMQ JobOptions
   * @returns
   */
  async launchJob(job: Scheduler.Job, opts?: JobsOptions) {
    const jobName = job.jobName ?? `${job.queue}-${!!job.kind ? job.kind + "-" : ""}${randomSlug()}`;
    return this.bullMqRouterService.addJob(job.queue, jobName, job.data, opts);
  }

  /**
   * Schedules a job to be processed at a specific timestamp
   * @param job JobData to schedule
   * @param opts BullMQ JobOptions
   */
  async scheduleJob(job: Scheduler.ScheduledJob, opts?: JobsOptions) {
    const eventData: Prisma.ScheduledTaskCreateInput = { ...job, executeAt: job.executeAt.toDate() };
    const scheduledTask = await this._pgService.scheduledTask.create({ data: eventData });
    const delaySeconds = Math.max(job.executeAt.unix() - moment().unix(), MIN_SCHEDULE_DELAY);
    if (delaySeconds === MIN_SCHEDULE_DELAY) throw new Error("Scheduled jobs must execute at least 10 seconds later!");
    const delay = delaySeconds * 1000;
    const options: JobsOptions = { delay, timestamp: scheduledTask.createdAt.getTime(), ...opts };
    const bullJob = await this.bullMqRouterService.addScheduledJob(scheduledTask.id, options);
    await this._pgService.scheduledTask.update({ where: { id: scheduledTask.id }, data: { jobId: bullJob.id } });
    return { ...scheduledTask, jobId: bullJob.id };
  }
}
