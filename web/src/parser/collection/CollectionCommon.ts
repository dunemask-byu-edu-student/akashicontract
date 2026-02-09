import { ACREnum, ACREnumStateMap, ACRObject, ACRObjectStateMap } from "../elements/ElementsCommon";
import { ACErrorCollectionMap, ACRError } from "../errors/ErrorsCommon";
import { ACLocalizationStateMap, LocalizationCode } from "../localization/LocalizationCommon";

export enum ACRecordKind {
  L10N = "L10N",
  ERR = "ERR",
  ENUM = "ENUM",
  OBJ = "OBJ",
}

export type ACRecordCollection = {
  [ACRecordKind.ENUM]: ACREnumStateMap;
  [ACRecordKind.OBJ]: ACRObjectStateMap;
  [ACRecordKind.ERR]: ACErrorCollectionMap;
  [ACRecordKind.L10N]: ACLocalizationStateMap;
};

export const reducedRecordKinds = Object.values(ACRecordKind).filter(
  (k): k is Exclude<ACRecordKind, ACRecordKind.L10N> => k !== ACRecordKind.L10N,
);
export type ReducedRecordKind = (typeof reducedRecordKinds)[number];

export type AkashicCollectionLocalizationGenerator = Record<LocalizationCode, AsyncGenerator<string> | undefined>;

export type AkashicCollectionRecordGenerator = Record<ReducedRecordKind, AsyncGenerator<string> | undefined> & {
  [ACRecordKind.L10N]: AkashicCollectionLocalizationGenerator | undefined;
};

export type DecodeLineReturn<K extends ReducedRecordKind> = K extends ACRecordKind.ENUM
  ? ACREnum
  : K extends ACRecordKind.OBJ
    ? ACRObject
    : K extends ACRecordKind.ERR
      ? ACRError
      : never;
