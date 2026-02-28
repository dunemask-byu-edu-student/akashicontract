import { CClientConfig, ClientConfig } from "@atlas/contracts";
import { validateRuntimeConfig } from "./config-validator";

export type ValidatedClientConfig = CClientConfig["ClientConfig"];

export type RuntimeConfigShape = {
  configPath: string;
  initConfig: boolean;
  pull: boolean;
  watch: boolean;
  production: boolean;
  client?: ValidatedClientConfig;
};

export type LockedConfig = {
  readonly LOG_LEVEL: number;
  readonly SYNCING: {
    readonly AKC_RECORD_REF: string;
    readonly AKC_RECORD_INSTANCE: string;
    readonly PERFORM_SYNC: boolean;
    readonly PERFORM_WATCH: boolean;
  };
  readonly BUILDER: {
    readonly PRODUCTION_MODE: boolean;
    readonly OUTPUT_CONFIG: ValidatedClientConfig["output"];
  };
};

class ConfigBuilder {
  private state: RuntimeConfigShape = {
    configPath: "akc.yaml",
    initConfig: false,
    pull: false,
    watch: false,
    production: false,
  };

  private locked = false;
  private finalConfig?: LockedConfig;

  set<K extends keyof RuntimeConfigShape>(key: K, value: RuntimeConfigShape[K]) {
    if (this.locked) throw new Error("Config is locked and cannot be modified.");
    this.state[key] = value;
  }

  get<K extends keyof RuntimeConfigShape>(key: K) {
    return this.state[key];
  }

  loadValidatedClientConfig(data: unknown) {
    if (this.locked) throw new Error("Config is locked.");

    const validated = ClientConfig.ClientConfig.validateSync(data, {
      stripUnknown: true,
      strict: true,
      disableStackTrace: true,
      abortEarly: false,
    });

    this.state.client = validated;
  }

  lock(): LockedConfig {
    if (this.locked && this.finalConfig) return this.finalConfig;

    validateRuntimeConfig(this.state);
    if (!this.state.client) throw new Error("Client config was never initialized!");
    this.finalConfig = Object.freeze({
      LOG_LEVEL: 30,
      SYNCING: {
        AKC_RECORD_REF: this.state.client.recordRef,
        AKC_RECORD_INSTANCE: this.state.client.recordInstance,
        PERFORM_SYNC: this.state.pull,
        PERFORM_WATCH: this.state.watch,
      },
      BUILDER: {
        PRODUCTION_MODE: this.state.production,
        OUTPUT_CONFIG: this.state.client.output,
      },
    });

    this.locked = true;
    return this.finalConfig;
  }

  getLocked(): LockedConfig {
    if (!this.locked || !this.finalConfig) throw new Error("Config has not been locked yet.");
    return this.finalConfig;
  }
}

const builder = new ConfigBuilder();

/**
 * Used ONLY during bootstrap
 */
export const config = builder;

/**
 * Used everywhere else in the app
 */
export const CONFIG = {
  get value() {
    return builder.getLocked();
  },
};
