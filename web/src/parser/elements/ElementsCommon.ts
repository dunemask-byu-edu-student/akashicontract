export const ACRawList = ["string", "boolean", "number"] as const;
export const ACRefList = ["object", "enum"] as const;
export type ACRef = (typeof ACRefList)[number];
export type ACRaw = (typeof ACRawList)[number];
export type ACElementKind = ACRef | "raw";

interface ACRObjectChildCore {
  isNullable: boolean;
  isArray: boolean;
  property: string;
}

export type ACElementReference = ACRObjectChildCore & { vin: string; kind: ACRef };

export type ACElementRaw = ACRObjectChildCore & { raw: ACRaw; kind: "raw" };

export type ACRObjectChild = ACElementReference | ACElementRaw;

export interface ACRObject {
  vin: string;
  children: ACRObjectChild[];
}

export interface ACREnum {
  vin: string;
  values: string[];
}

export interface AcElementState {
  objects: ACRObject[];
  enums: ACREnum[];
}

export const ACRefVinPrefix = {
  object: "obj_",
  enum: "enm_",
} as const satisfies Record<ACRef, string>;

type ToMap<T> = T extends (infer U)[] ? Map<string, U> : never; // Generated with AI
export type ACElementStateMap = { [K in keyof AcElementState]: ToMap<AcElementState[K]> }; // Generated with AI
export type ACREnumStateMap = ToMap<AcElementState["enums"]>;
export type ACRObjectStateMap = ToMap<AcElementState["objects"]>;
