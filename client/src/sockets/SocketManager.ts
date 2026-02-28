import { CONFIG } from "@config";
import { CObjectDefinition } from "@atlas/contracts";
import { ContractGenerator } from "@atlas/scaffold/Generator";
import { getGeneratorClass } from "../generators";
import { io, Socket } from "socket.io-client";

export class SocketManager {
  static readonly maxSequentialReconnectAttempts = 120;
  private readonly socket: Socket;
  private reconnectAttempts = 0;
  private readonly generators: ContractGenerator[];
  private contractStore = new Map<string, CObjectDefinition["ObjectDefinition"]>();

  constructor() {
    this.socket = io(CONFIG.value.SYNCING.AKC_RECORD_INSTANCE, { reconnection: false, autoConnect: false, retries: 0 });
    this.generators = CONFIG.value.BUILDER.OUTPUT_CONFIG.map(({ lang, dir }) => new (getGeneratorClass(lang))(dir));
    this.bindListeners();
  }

  async connect() {
    this.socket.connect();
  }

  private bindListeners() {
    this.socket.on("connect", this.onConnect.bind(this));
    this.socket.on("disconnect", this.onDisconnect.bind(this));
    this.socket.on("connect_error", this.onConnectError.bind(this));
    this.socket.on("contracts.init", this.onContractsInit.bind(this));
    this.socket.on("contract.set", this.onContractSet.bind(this));
    this.socket.on("contract.del", this.onContractDel.bind(this));
  }

  private onConnect() {
    console.log(`Websockets Connected successfully!`);
    this.reconnectAttempts = 0;
  }

  private onConnectError(err: Error) {
    const displayError = `Connection Error, Message: ${err.stack ?? err.message}`;
    console.error(`Could not connect to ${CONFIG.value.SYNCING.AKC_RECORD_INSTANCE}, ${displayError}`);
    this.onDisconnect();
  }

  private async onDisconnect() {
    this.reconnectAttempts++;
    if (this.reconnectAttempts >= SocketManager.maxSequentialReconnectAttempts) {
      console.error("Max sequential reconnects reached!");
      process.exit(1);
    }
    console.warn("Disconnected! Waiting 5 seconds before trying again...");
    setTimeout(() => this.connect(), 5000);
  }

  private async onContractsInit({ data }: { data: CObjectDefinition["ObjectDefinition"][] }) {
    this.contractStore.clear();
    for (const contract of data) this.contractStore.set(contract.id, contract);
    for (const generator of this.generators) await generator.generateContracts(data);
  }

  private async onContractSet({ data }: { data: CObjectDefinition["ObjectDefinition"] }) {
    this.contractStore.set(data.id, data);
    for (const generator of this.generators) await generator.writeContract(data);
  }

  private async onContractDel({ id }: { id: string }) {
    const definition = this.contractStore.get(id);
    if (!definition) {
      console.warn(`Received contract.del for unknown id: ${id}`);
      return;
    }
    this.contractStore.delete(id);
    for (const generator of this.generators) await generator.deleteContract(definition);
  }
}
