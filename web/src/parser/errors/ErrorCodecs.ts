import { ACRError } from "./ErrorsCommon";

enum CodecTokens {
  PARTS = "|",
  VALUES = ",",
  UNDEFINED = "%",
}

export class ErrorCodecs {
  encode(error: ACRError): string {
    const encodedValues = [
      error.httpCode,
      error.clientMessageKey,
      error.clientDetailKey ?? CodecTokens.UNDEFINED,
      error.objectRef ?? CodecTokens.UNDEFINED,
    ];
    const errorValues = encodedValues.join(CodecTokens.VALUES);
    return [error.vin, errorValues].join(CodecTokens.PARTS);
  }

  decode(encodedError: string): ACRError {
    const [vin, encodedValues] = encodedError.split(CodecTokens.PARTS);
    const encodedValueParts = encodedValues.split(CodecTokens.VALUES);
    if (encodedValueParts.length !== 4) throw new Error(`Invalid encoded value part length!`);
    const [httpCodeString, clientMessageKey, clientDetailKey, objectRef] = encodedValueParts;

    return {
      vin,
      httpCode: parseInt(httpCodeString),
      clientMessageKey,
      clientDetailKey: clientDetailKey === CodecTokens.UNDEFINED ? undefined : clientDetailKey,
      objectRef: objectRef === CodecTokens.UNDEFINED ? undefined : objectRef,
    };
  }
}
