import { Processor, WorkerHost } from "@nestjs/bullmq";
import { Job } from "bullmq";
import { LOG } from "@akc/logging";
import { OnApplicationShutdown } from "@nestjs/common";
import { ApiClientError } from "@atlas/scaffold/ApiClient";
import { EventQueue } from "./queues";
import * as y from "yup";

export const EventQueueProcessor = (queue: EventQueue) => Processor(queue);

export abstract class EventQueueWorker<T = unknown> extends WorkerHost implements OnApplicationShutdown {
  constructor(private readonly schema: y.Schema<T>) {
    super();
  }

  async onApplicationShutdown(signal?: string) {
    await this.worker?.close();
  }

  async process(job: Job<T>): Promise<void> {
    const jobData = await this.schema.validate(job.data).catch(() => null);
    if (!jobData) return LOG.warnTag(`WORKER '${this.worker.name}'`, `Bad job ${JSON.stringify(job.data)}`);
    const err = await this.processJob(job).catch((err: Error) => err);
    if (!(err instanceof Error)) return;
    if (typeof this.onJobError === "function") await this.onJobError(err, job);
    else this.defaultOnJobError(err, job);
  }

  private defaultOnJobError(err: unknown, job: Job<T>) {
    LOG.errorTag(`WORKER '${this.worker.name}'`, `Unexpected error during job processing '${job.id}'`);
    if (err instanceof ApiClientError) return LOG.errorTag(`WORKER '${this.worker.name}'`, err.serialize());
    if (!(err instanceof Error)) return LOG.errorTag(`WORKER '${this.worker.name}'`, `Unknown Value: ${err}`);
    LOG.errorTag(`WORKER '${this.worker.name}'`, `${err.name}: ${err.message}`);
    LOG.errorTag(`WORKER '${this.worker.name}'`, err.stack ?? "Unknown Location!");
  }

  protected abstract processJob(job: Job<T>): Promise<void>;
  protected onJobError?(err: unknown, job: Job<T>): Promise<void> | void;
}

export declare type EventQueueJob<T extends y.Schema> = Job<y.InferType<T>>;
