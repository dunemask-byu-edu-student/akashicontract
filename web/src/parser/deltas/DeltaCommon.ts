import { ACRecordKind } from "../collection/CollectionCommon";

export enum ACDeltaOperation {
  DELETE = "DELETE",
  SET = "SET",
}

export interface ACDelta {
  kind: ACRecordKind;
  op: ACDeltaOperation;
  target: string;
  payload?: string;
}

export type ACDeltaMap = Map<string, ACDelta>;
