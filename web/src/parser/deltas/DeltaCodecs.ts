import { ACRecordKind } from "../collection/CollectionCommon";
import { ACDelta, ACDeltaOperation } from "./DeltaCommon";

enum CodecTokens {
  PART_SEPARATOR = ":",
  UNDEFINED = "%",
}

const deltaOps = Object.values(ACDeltaOperation);
const deltaOpKinds = Object.values(ACRecordKind);

export class DeltaCodecs {
  encodeDelta(d: ACDelta): string {
    const encodedParts = [d.kind, d.op, d.target, d.payload ?? CodecTokens.UNDEFINED];
    return encodedParts.join(CodecTokens.PART_SEPARATOR);
  }
  decodeDelta(encodedDelta: string): ACDelta {
    const encodedParts = encodedDelta.split(CodecTokens.PART_SEPARATOR);
    if (encodedParts.length !== 4) throw new Error(`Invalid delta '${encodedDelta}'`);
    const [kindString, opString, target, payloadString] = encodedParts;
    const kind = kindString as ACRecordKind;
    const op = opString as ACDeltaOperation;
    const payload = payloadString === CodecTokens.UNDEFINED ? undefined : payloadString;
    if (!deltaOpKinds.includes(kind)) throw new Error(`Invalid kind '${kind}' of ${encodedDelta}`);
    if (!deltaOps.includes(op)) throw new Error(`Invalid operation '${op}' of ${encodedDelta}`);
    return { kind, op, target, payload };
  }
}
