import {
  ACRecordKind,
  ACRecordCollection,
  AkashicCollectionRecordGenerator,
  DecodeLineReturn,
  ReducedRecordKind,
  reducedRecordKinds,
} from "./CollectionCommon";
import { ElementCodecs } from "../elements/ElementCodecs";
import { ACREnum, ACRObject } from "../elements/ElementsCommon";
import { ErrorCodecs } from "../errors/ErrorCodecs";
import { ACRError } from "../errors/ErrorsCommon";
import { LocalizationCodecs } from "../localization/LocalizationCodecs";
import { LocalizationCode } from "../localization/LocalizationCommon";

const elementCodecs = new ElementCodecs();
const errorCodecs = new ErrorCodecs();
const localizationCodecs = new LocalizationCodecs();

function decodeLine<K extends ReducedRecordKind>(kind: K, line: string): DecodeLineReturn<K> {
  switch (kind) {
    case ACRecordKind.ENUM:
      return elementCodecs.decodeEnum(line) as DecodeLineReturn<K>;
    case ACRecordKind.OBJ:
      return elementCodecs.decodeObject(line) as DecodeLineReturn<K>;
    case ACRecordKind.ERR:
      return errorCodecs.decode(line) as DecodeLineReturn<K>;
    default:
      throw new Error(`Unknown kind '${kind}'`);
  }
}

function getDecodedTarget<K extends ReducedRecordKind>(kind: K, record: DecodeLineReturn<K>): string {
  switch (kind) {
    case ACRecordKind.ENUM:
    case ACRecordKind.OBJ:
    case ACRecordKind.ERR:
      return (record as ACREnum | ACRObject | ACRError).vin;
    default:
      throw new Error(`Unsupported record kind: '${kind}'`);
  }
}

export class CollectionParser {
  declare collection: ACRecordCollection;

  public static getEmptyCollection() {
    return Object.fromEntries(
      Object.values(ACRecordKind).map((kind) => {
        const map = new Map();
        if (kind === ACRecordKind.L10N)
          Object.values(LocalizationCode).forEach((c) => map.set(c, new Map<string, string>()));
        return [kind, map];
      }),
    ) as ACRecordCollection;
  }

  constructor(private readonly collectionGenerator: AkashicCollectionRecordGenerator) {
    this.collection = CollectionParser.getEmptyCollection();
  }

  async parseCollection(): Promise<ACRecordCollection> {
    // Parse non-localization records
    for (const kind of reducedRecordKinds) {
      for await (const line of this.collectionGenerator[kind] ?? []) {
        this.parseKindLine(kind, line);
      }
    }

    // Parse localization records
    for (const locale of Object.values(LocalizationCode)) {
      for await (const line of this.collectionGenerator[ACRecordKind.L10N]?.[locale] ?? []) {
        this.parseLocalization(locale, line);
      }
    }
    return this.collection;
  }

  private parseKindLine<K extends ReducedRecordKind>(kind: K, line: string) {
    const decoded = decodeLine(kind, line);
    const key = getDecodedTarget(kind, decoded);
    (this.collection[kind] as Map<string, DecodeLineReturn<K>>).set(key, decoded);
  }

  private parseLocalization(locale: LocalizationCode, line: string) {
    const { key, text } = localizationCodecs.decodeMapping(line);
    let localeMap = this.collection[ACRecordKind.L10N].get(locale);
    if (!localeMap) {
      localeMap = new Map<string, string>();
      this.collection[ACRecordKind.L10N].set(locale, localeMap);
    }
    localeMap.set(key, text);
  }
}
