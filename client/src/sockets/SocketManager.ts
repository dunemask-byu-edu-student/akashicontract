import { CONFIG } from "@config";
import { io, Socket } from "socket.io-client";

export class SocketManager {
  static readonly maxSequentialReconnectAttempts = 120;
  private readonly socket: Socket;
  private reconnectAttempts = 0;

  constructor() {
    this.socket = io(CONFIG.value.SYNCING.AKC_RECORD_INSTANCE, { reconnection: false, autoConnect: false, retries: 0 });
    this.bindListeners();
  }
  async connect() {
    this.socket.connect();
  }

  private bindListeners() {
    this.socket.on("connect", this.onConnect.bind(this));
    this.socket.on("disconnect", this.onDisconnect.bind(this));
    this.socket.on("connect_error", this.onConnectError.bind(this));
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
}
