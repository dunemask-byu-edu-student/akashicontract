import { LOG } from "@akc/logging";
import { Injectable } from "@nestjs/common";
import cluster, { Worker } from "node:cluster";
import os from "node:os";
import process from "node:process";
import CONFIG from "@akc/config";
const numCPUs = CONFIG.APPLICATION_ENV === "production" ? Math.min(os.cpus().length, 1) : 1;

@Injectable()
export class ClusterService {
  static clusterize(callback: Function): void {
    if (!cluster.isPrimary) return this.configureWorker(callback);
    ClusterService.configurePrimary();
  }

  private static configurePrimary() {
    LOG.debugTag("CLUSTER MASTER", `CLUSTER MASTER (${process.pid}) IS RUNNING `);
    for (let i = 0; i < numCPUs; i++) cluster.fork();
    cluster.on("exit", ClusterService.onWorkerExit);
    process.on("SIGTERM", ClusterService.onProcessSigterm);
  }

  private static configureWorker(callback: Function) {
    LOG.debugTag("CLUSTER WORKER", `WORKER (${process.pid}) IS RUNNING `);
    callback();
  }

  private static onWorkerExit(worker: Worker, code: number, signal: string) {
    LOG.debugTag("CLUSTER WORKER", `Worker ${worker.process.pid} exited with signal ${signal} and code '${code}'`);
  }

  private static onProcessSigterm() {
    if (!cluster.workers) return LOG.debugTag("CLUSTER MASTER", "No cluster workers found! Aborting siterm response");
    LOG.debugTag("CLUSTER MASTER", "Master received SIGTERM, initiating graceful shutdown of workers");
    for (const id in cluster.workers) cluster.workers[id]?.kill("SIGTERM");
  }
}
