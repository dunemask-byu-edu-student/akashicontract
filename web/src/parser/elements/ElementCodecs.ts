import {
  ACElementRaw,
  ACElementReference,
  ACREnum,
  ACRObject,
  ACRObjectChild,
  ACRaw,
  ACRawList,
  ACRef,
  ACRefVinPrefix,
  ACRefList,
  AcElementState,
} from "./ElementsCommon";

enum CodecTokens {
  PARTS = "|",
  OBJECT_CHILD = ":",
  ENUM_VALUE = ",",
  OBJECT_MAPPING = ",",
}

enum ElementState {
  NullableSingle = 0,
  RequiredSingle = 1,
  NullableArray = 2,
  RequiredArray = 3,
}

const RawCodecs = {
  s: "string",
  b: "boolean",
  n: "number",
} as const satisfies Record<string, ACRaw | undefined>;

const RefCodecs = {
  object: "o",
  enum: "e",
} as const satisfies Record<ACRef, string>;

enum CodecKeywords {
  OBJECT_ANY = "any",
}

export type EncodedAcElementState = Record<keyof AcElementState, string[]>;
type ElementObjectState = { isArray: boolean; isNullable: boolean };

const getElementState = (s: ElementObjectState) => (+s.isArray * 2 + +!s.isNullable * 1) as ElementState;
const getObjectElementState = (s: ElementState) => ({ isArray: s > 1, isNullable: !(s % 2) }) as ElementObjectState;

export class ElementCodecs {
  encode(state: AcElementState): EncodedAcElementState {
    const encodedState: Record<keyof AcElementState, string[]> = {
      objects: [],
      enums: [],
    };
    for (const elementEntry of Object.entries(state)) {
      const [elementType, elements] = elementEntry as [keyof AcElementState, AcElementState[keyof AcElementState]];
      if (elementType === "enums") encodedState[elementType] = elements.map((e) => this.encodeEnum(e as ACREnum));
      if (elementType === "objects") encodedState[elementType] = elements.map((e) => this.encodeObject(e as ACRObject));
    }
    return encodedState;
  }

  encodeObject(object: ACRObject): string {
    const vinPrefix = ACRefVinPrefix.object;
    if (!object.vin.startsWith(vinPrefix)) throw new Error(`Object '${object.vin}' has an invalid VIN prefix`);
    const vin = object.vin.substring(vinPrefix.length);
    const objectChildren = object.children;
    const encodedMappings = objectChildren.map((mapping) => this.encodeObjectChild(mapping));
    const objectChildrentring =
      encodedMappings.length > 0 ? encodedMappings.join(CodecTokens.OBJECT_MAPPING) : CodecKeywords.OBJECT_ANY;
    const parts = [vin, objectChildrentring];
    return parts.join(CodecTokens.PARTS);
  }

  encodeEnum(acEnum: ACREnum): string {
    const vinPrefix = ACRefVinPrefix.enum;
    if (!acEnum.vin.startsWith(vinPrefix)) throw new Error(`Enum '${acEnum.vin}' has an invalid VIN prefix`);
    if (acEnum.values.length === 0) throw new Error("Enums must always have at least one item!");
    const vin = acEnum.vin.substring(vinPrefix.length);
    const parts = [vin, acEnum.values.join(CodecTokens.ENUM_VALUE)];
    return parts.join(CodecTokens.PARTS);
  }

  private encodeRaw(elementRaw: ACElementRaw): string {
    const { raw, property } = elementRaw;
    if (!ACRawList.includes(raw)) throw new Error(`Invalid Raw Element '${raw}'`);
    const encRaw = raw[0];
    const elementState = getElementState(elementRaw);
    return [encRaw, elementState, property].join("");
  }

  private encodeElementReference(elementReference: ACElementReference): string {
    const { vin, property } = elementReference;
    const acRef = ACRefList.find((acRef) => vin.startsWith(ACRefVinPrefix[acRef]));
    if (!acRef) throw new Error(`Could not find ref from VIN '${vin}'`);
    const encodedPrefix = RefCodecs[acRef];
    if (!encodedPrefix)
      throw new Error(`Element Refrence '${JSON.stringify(elementReference)}' has an invalid VIN prefix`);
    const rawVin = vin.substring(ACRefVinPrefix[acRef].length);
    const elementState = getElementState(elementReference);
    return [encodedPrefix, elementState, rawVin, CodecTokens.OBJECT_CHILD, property].join("");
  }

  private encodeObjectChild(objectChild: ACRObjectChild): string {
    if (!!(objectChild as ACElementRaw).raw) return this.encodeRaw(objectChild as ACElementRaw);
    return this.encodeElementReference(objectChild as ACElementReference);
  }

  decode(encoded: EncodedAcElementState): AcElementState {
    const decodedState: AcElementState = { objects: [], enums: [] };
    for (const elementEntry of Object.entries(encoded)) {
      const [elementType, elements] = elementEntry as [keyof AcElementState, string[]];
      if (elementType === "enums") decodedState[elementType] = elements.map((e) => this.decodeEnum(e));
      if (elementType === "objects") decodedState[elementType] = elements.map((e) => this.decodeObject(e));
    }
    return decodedState;
  }

  private decodeRaw(encodedRaw: string): ACElementRaw {
    if (encodedRaw.length < 3) throw new Error(`Raw'${encodedRaw}' has an invalid number of parts`);

    const encodedRawType = encodedRaw[0] as keyof typeof RawCodecs;
    const elementState = Number(encodedRaw[1]) as ElementState;
    const raw = RawCodecs[encodedRawType] as (typeof RawCodecs)[keyof typeof RawCodecs] | undefined;
    if (!raw) throw new Error(`Invalid raw value '${encodedRawType}'`);
    if (isNaN(elementState)) throw new Error(`Bad Element State '${elementState}'`);
    if (!Object.values(ElementState).includes(elementState)) throw new Error(`Extra State '${elementState}'`);
    const property = encodedRaw.substring(2);
    const { isNullable, isArray } = getObjectElementState(elementState);
    return { raw, isNullable, isArray, property, kind: "raw" };
  }

  private decodeElementReference(encodedRef: string): ACElementReference {
    const propertyDefIndex = encodedRef.indexOf(CodecTokens.OBJECT_CHILD);
    if (propertyDefIndex === -1) throw new Error(`Invalid encoded ref '${encodedRef}'`);
    const encodedRefType = encodedRef[0] as (typeof RefCodecs)[keyof typeof RefCodecs];
    const elementState = Number(encodedRef[1]) as ElementState;
    const refVin = encodedRef.substring(2, propertyDefIndex);
    const property = encodedRef.substring(propertyDefIndex + 1);
    if (!refVin) throw new Error(`Invalid VIN '${encodedRefType}'`);
    if (isNaN(elementState)) throw new Error(`Bad Element State '${elementState}'`);
    if (!Object.values(ElementState).includes(elementState)) throw new Error(`Extra State '${elementState}'`);
    const { isNullable, isArray } = getObjectElementState(elementState);
    const acRef = ACRefList.find((acRef) => encodedRefType.startsWith(RefCodecs[acRef]));
    if (!acRef) throw new Error(`Element Reference '${encodedRef}' has an invalid VIN prefix`);
    const vin = `${ACRefVinPrefix[acRef]}${refVin}`;
    return { vin, isNullable, isArray, property, kind: acRef };
  }

  private decodeChildObject(encodedChildObject: string): ACRObjectChild {
    const isRaw = Object.keys(RawCodecs).includes(encodedChildObject[0]);
    if (isRaw) return this.decodeRaw(encodedChildObject);
    return this.decodeElementReference(encodedChildObject);
  }

  decodeObject(e: string): ACRObject {
    const encodedParts = e.split(CodecTokens.PARTS);
    if (encodedParts.length !== 2) throw new Error(`Item '${e}' has an invalid number of parts`);
    const [rawVin, encodedChildObjects] = encodedParts;
    const vin = `${ACRefVinPrefix.object}${rawVin}`;
    if (encodedChildObjects === "any") return { vin, children: [] };
    const encodedChildObjectSegments = encodedChildObjects.split(CodecTokens.OBJECT_MAPPING);
    if (encodedChildObjectSegments.length === 0) throw new Error(`Object '${e}' must have at least one child object!`);
    const children = encodedChildObjectSegments.map((s) => this.decodeChildObject(s));
    return { vin, children };
  }

  decodeEnum(e: string): ACREnum {
    const encodedParts = e.split(CodecTokens.PARTS);
    if (encodedParts.length !== 2) throw new Error(`Enum '${e}' has an invalid number of parts`);
    const [rawVin, encodedValues] = encodedParts;
    const vin = `${ACRefVinPrefix.enum}${rawVin}`;
    const values = encodedValues.split(CodecTokens.ENUM_VALUE);
    if (values.length === 0) throw new Error(`Enum '${e}' must have at least one value!`);
    return { vin, values };
  }
}
