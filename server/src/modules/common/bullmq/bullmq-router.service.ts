// generic-bullmq.service.ts
import { Injectable, OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import { Job, JobsOptions, Queue } from "bullmq";
import { EventQueue, EventQueues, ScheduledTaskQueueName } from "./queues";
import { ModuleRef } from "@nestjs/core";
import { getQueueToken } from "@nestjs/bullmq";

const validQueues = [...EventQueues, ScheduledTaskQueueName] as const;
declare type ValidQueue = (typeof validQueues)[number];
const DEFAULT_JOB_OPTIONS = {
  removeOnComplete: {
    age: 3600, // keep up to 1 hour
    count: 1000, // keep up to 1000 jobs
  },
  removeOnFail: {
    age: 24 * 3600, // keep up to 24 hours
  },
};

@Injectable()
export class BullmqRouterService implements OnModuleDestroy, OnModuleInit {
  constructor(private readonly moduleRef: ModuleRef) {}
  private queues: Map<ValidQueue, Queue> = new Map();

  /**
   * @warning Do not interface with this module directly if you are planning on adding jobs! An abstraction has been made in the SchedulerService
   * Add a job to bullMQ
   * @param queueName Event Queue to add the job to
   * @param jobName Name of the job to insert into the queue
   * @param data Data for the queue, this should be a valid JSON object
   * @param opts Additional BullMQ options
   * @returns A promise containing the BullMQ job
   */
  async addJob<T = unknown>(queueName: EventQueue, jobName: string, data: T, opts?: JobsOptions) {
    return this.addJobToQueue<T>(queueName, jobName, data, opts);
  }

  /**
   * @warning Do not interface with this module directly if you are planning on adding jobs! An abstraction has been made in the SchedulerService
   * Add a job to bullMQ to be processed by the Scheduler
   * @param scheduledTaskId ID of the scheduled task to add as a job for the Scheduler
   * @param opts Additional bullMQ options (Most likely, this will contain a delay for the job)
   * @returns
   */
  async addScheduledJob(scheduledTaskId: string, opts?: JobsOptions) {
    return this.addJobToQueue(ScheduledTaskQueueName, scheduledTaskId, { scheduledTaskId }, opts);
  }

  private async addJobToQueue<T = unknown>(queueName: ValidQueue, jobName: string, data: T, opts?: JobsOptions) {
    if (!validQueues.includes(queueName)) throw new Error(`Invalid queue '${queueName}' was provided!`);
    if (!this.queues.has(queueName)) throw Error(`Queue '${queueName}' has not been registered!`);
    const jobOptions: JobsOptions = { ...DEFAULT_JOB_OPTIONS, ...opts };
    const queue = this.queues.get(queueName)!;
    return queue.add(jobName, data, jobOptions);
  }

  async onModuleDestroy() {
    // Gracefully close all queues
    for (const queue of this.queues.values()) await queue.close();
  }

  async onModuleInit() {
    for (const queueName of validQueues) {
      const queue = this.moduleRef.get<Queue>(getQueueToken(queueName), { strict: false });
      if (!queue) throw new Error(`Queue '${queueName}' has not been registered yet!`);
      this.queues.set(queueName, queue);
    }
  }

  /**
   * @warning Do not interface with this module directly if you are planning on retrieving jobs! An abstraction has been made in the SchedulerService
   * Retrieve a job from bullMQ
   * @param queueName Event Queue to add the job to
   * @param jobId Id of the job to retrieve from the queue
   * @returns A promise containing the BullMQ job
   */
  async getJob(queueName: EventQueue, jobId: string): Promise<Job | undefined> {
    if (!validQueues.includes(queueName)) throw new Error(`Invalid queue '${queueName}' was provided!`);
    if (!this.queues.has(queueName)) throw Error(`Queue '${queueName}' has not been registered!`);
    return this.queues.get(queueName)?.getJob(jobId);
  }
}
