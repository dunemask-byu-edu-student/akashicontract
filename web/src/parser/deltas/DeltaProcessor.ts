import { ACDeltaMap, ACDeltaOperation } from "./DeltaCommon";
import { ElementCodecs } from "../elements/ElementCodecs";
import { ACREnum, ACRObject } from "../elements/ElementsCommon";
import { ACRecordKind, ACRecordCollection } from "../collection/CollectionCommon";
import { ErrorCodecs } from "../errors/ErrorCodecs";
import { ACRError } from "../errors/ErrorsCommon";
import { LocalizationCodecs } from "../localization/LocalizationCodecs";
import { ACLocalizationDeltaTarget } from "../localization/LocalizationCommon";

const elementCodecs = new ElementCodecs();
const errorCodecs = new ErrorCodecs();
const localizationCodecs = new LocalizationCodecs();

function decodePayload(sub: ACRecordKind.ENUM, op: ACDeltaOperation, payload: string): ACREnum;
function decodePayload(sub: ACRecordKind.OBJ, op: ACDeltaOperation, payload: string): ACRObject;
function decodePayload(sub: ACRecordKind.ERR, op: ACDeltaOperation, payload: string): ACRError;
function decodePayload(sub: ACRecordKind.L10N, op: ACDeltaOperation, payload: string): string;
function decodePayload(sub: ACRecordKind, op: ACDeltaOperation.DELETE): undefined;
function decodePayload(sub: ACRecordKind, op: ACDeltaOperation, payload?: string): unknown {
  if (op === ACDeltaOperation.DELETE) return undefined;
  if (!payload) throw new Error(`Invalid payload '${payload}' as operation is not delete!`);

  switch (sub) {
    case ACRecordKind.ENUM:
      return elementCodecs.decodeEnum(payload);
    case ACRecordKind.OBJ:
      return elementCodecs.decodeObject(payload);
    case ACRecordKind.ERR:
      return errorCodecs.decode(payload);
    case ACRecordKind.L10N:
      return payload;
    default:
      throw new Error(`Unknown kind '${sub}'`);
  }
}

export class DeltaProcessor {
  constructor(readonly collection: ACRecordCollection) {}

  resolveDeltas(deltaMap: ACDeltaMap, kind?: ACRecordKind) {
    this.resolveRevocations(deltaMap, kind);
    this.resolvePuts(deltaMap, kind);
  }

  private resolvePuts(deltaMap: ACDeltaMap, kind?: ACRecordKind) {
    for (const delta of deltaMap.values()) {
      if (delta.op === ACDeltaOperation.DELETE) continue;
      if (!delta.payload) continue;
      if (!!kind && kind !== delta.kind) continue;

      switch (delta.kind) {
        case ACRecordKind.ENUM: {
          const decoded = decodePayload(delta.kind, delta.op, delta.payload);
          this.collection[ACRecordKind.ENUM].set(delta.target, decoded);
          break;
        }

        case ACRecordKind.OBJ: {
          const decoded = decodePayload(delta.kind, delta.op, delta.payload);
          this.collection[ACRecordKind.OBJ].set(delta.target, decoded);
          break;
        }

        case ACRecordKind.ERR: {
          const decoded = decodePayload(delta.kind, delta.op, delta.payload);
          this.collection[ACRecordKind.ERR].set(delta.target, decoded);
          break;
        }

        case ACRecordKind.L10N: {
          const target = localizationCodecs.decodeDeltaTarget(delta.target);
          const value = decodePayload(delta.kind, delta.op, delta.payload);
          this.setLocalizationTarget(target, value);
          break;
        }

        default:
          throw new Error(`Unknown kind '${delta.kind}'`);
      }
    }
  }

  private resolveRevocations(deltaMap: ACDeltaMap, kind?: ACRecordKind) {
    for (const delta of deltaMap.values()) {
      if (delta.op !== ACDeltaOperation.DELETE) continue;
      if (!!kind && kind !== delta.kind) continue;

      switch (delta.kind) {
        case ACRecordKind.ENUM:
          this.collection[ACRecordKind.ENUM].delete(delta.target);
          break;

        case ACRecordKind.OBJ:
          this.collection[ACRecordKind.OBJ].delete(delta.target);
          break;

        case ACRecordKind.ERR:
          this.collection[ACRecordKind.ERR].delete(delta.target);
          break;

        case ACRecordKind.L10N:
          this.revokeLocalizationTarget(localizationCodecs.decodeDeltaTarget(delta.target));
          break;

        default:
          throw new Error(`Unknown kind '${delta.kind}'`);
      }
    }
  }

  private revokeLocalizationTarget(target: ACLocalizationDeltaTarget): boolean {
    if (target.locale !== "*") return !!this.collection[ACRecordKind.L10N].get(target.locale)?.delete(target.key);
    for (const localeMap of this.collection[ACRecordKind.L10N].values()) localeMap.delete(target.key);
    return true;
  }

  private setLocalizationTarget(target: ACLocalizationDeltaTarget, value: string) {
    if (target.locale === "*") {
      for (const localeMap of this.collection[ACRecordKind.L10N].values()) localeMap.set(target.key, value);
    } else {
      let localeMap = this.collection[ACRecordKind.L10N].get(target.locale);
      if (!localeMap) {
        localeMap = new Map();
        this.collection[ACRecordKind.L10N].set(target.locale, localeMap);
      }
      localeMap.set(target.key, value);
    }
  }
}
