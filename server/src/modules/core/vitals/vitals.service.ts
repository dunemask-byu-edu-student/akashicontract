import CONFIG from "@akc/config";
import { PostgresService } from "@akc/postgres";
import { LOG } from "@akc/logging";
import { Injectable, OnModuleDestroy, OnModuleInit, RequestMethod } from "@nestjs/common";
import { METHOD_METADATA, PATH_METADATA } from "@nestjs/common/constants";
import { DiscoveryService, Reflector } from "@nestjs/core";
import { DEPRECATED_FLAG } from "@akc/nest-extras";

@Injectable()
export class VitalsService implements OnModuleInit, OnModuleDestroy {
  constructor(
    private _pgService: PostgresService,
    private readonly _discoveryService: DiscoveryService,
    private readonly _reflector: Reflector,
  ) {}

  async healthy() {
    // Healthchecks to perform asyncly
    await Promise.all([
      this._pgService.scheduledTask.findFirst(), // Check Postgres
    ]);
  }

  async onModuleInit() {
    const endpoints = await this.getEndpoints();
    const supportedRoutes = endpoints.filter(({ deprecatedAt }) => !deprecatedAt);
    const deprecatedRoutes = endpoints.filter(({ deprecatedAt }) => !!deprecatedAt);
    for (const endpoint of supportedRoutes) LOG.debugTag("ROUTE", endpoint.display);
    if (deprecatedRoutes.length > 0) LOG.warnTag(`ROUTE`, "Deprecated Routes:");
    for (const endpoint of deprecatedRoutes)
      LOG.warnTag("ROUTE", `Deprecated At ${endpoint.deprecatedAt} ${endpoint.display}`);

    if (CONFIG.APPLICATION_ENV !== "production") return;
  }

  async onModuleDestroy() {
    if (CONFIG.APPLICATION_ENV !== "production") return;
  }

  private async getEndpoints() {
    const rawEndpoints: Array<{ path: string; method: string; deprecatedAt: string | undefined }> = [];
    const controllers = this._discoveryService.getControllers();
    controllers.forEach((wrappper) => {
      const { instance } = wrappper;
      if (instance) {
        const controllerDeprecated = this._reflector.get<string>(DEPRECATED_FLAG, instance.constructor);
        const controllerPath = this._reflector.get<string | undefined>(PATH_METADATA, instance.constructor);
        const methods = Object.getOwnPropertyNames(Object.getPrototypeOf(instance));
        methods.forEach((methodName) => {
          const methodHandler = instance[methodName];
          const methodDeprecated = this._reflector.get<string | undefined>(DEPRECATED_FLAG, methodHandler);
          const methodPath = this._reflector.get<string>(PATH_METADATA, methodHandler);
          const requestMethod = this._reflector.get<RequestMethod>(METHOD_METADATA, methodHandler);
          const baseUri = `${controllerPath}  `;
          const method = RequestMethod[requestMethod];
          if (method) {
            const path = methodPath == "/" ? baseUri : `${baseUri}/${methodPath}`;
            rawEndpoints.push({
              path: path
                .replaceAll(/\s+/g, "") // "Remove Excess Spaces"
                .replaceAll(/\/\/+/g, "/") // "Remove Double Slashes"
                .replace(/^([^/])/, "/$1"),
              method: method,
              deprecatedAt: methodDeprecated ?? controllerDeprecated,
            });
          }
        });
      }
    });
    const normalizedEndpoints = Array.from(
      new Set(
        rawEndpoints
          .map(({ path, method, deprecatedAt }) => ({
            path,
            method,
            deprecatedAt,
            display: `${method + " ".repeat(8 - method.length)} ${path}`,
          }))
          .sort((a, b) => a.path.localeCompare(b.path)),
      ),
    );
    const endpointMap = new Map<string, (typeof normalizedEndpoints)[number]>();
    for (const endpoint of normalizedEndpoints) endpointMap.set(JSON.stringify(endpoint), endpoint);
    return Array.from(endpointMap.values());
  }
}
