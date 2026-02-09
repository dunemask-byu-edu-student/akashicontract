export interface ACRError {
  vin: string;
  httpCode: number;
  clientMessageKey: string;
  clientDetailKey?: string | null;
  objectRef?: string | null;
}

export type ACErrorCollectionMap = Map<string, ACRError>;

// What would actually get sent to the client
// export interface ACSerializedError {
//   id: string;
//   httpCode: number;
//   name: string;
//   clientMessage: string;
//   clientDetail?: string | null;
//   debugMessage?: string | null;
//   debugData?: object | null;
// }

// export type ACTransmissableSerializedError = Omit<ACSerializedError, "httpCode">;
