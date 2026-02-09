import { ElementCodecs } from "../elements/ElementCodecs";
import { ACREnum, ACRObject } from "../elements/ElementsCommon";
import { ErrorCodecs } from "../errors/ErrorCodecs";
import { ACRError } from "../errors/ErrorsCommon";
import { LocalizationCodecs } from "../localization/LocalizationCodecs";
import { LocalizationCode } from "../localization/LocalizationCommon";
import {
  ACRecordCollection,
  ACRecordKind,
  AkashicCollectionRecordGenerator,
  reducedRecordKinds,
  ReducedRecordKind,
  AkashicCollectionLocalizationGenerator,
  DecodeLineReturn,
} from "./CollectionCommon";

const elementCodecs = new ElementCodecs();
const errorCodecs = new ErrorCodecs();
const localizationCodecs = new LocalizationCodecs();

export class CollectionExporter {
  constructor(private readonly collection: ACRecordCollection) {}

  exportCollection(): AkashicCollectionRecordGenerator {
    const recordGenerator: Partial<AkashicCollectionRecordGenerator> = {};

    // Export non-localization records
    for (const kind of reducedRecordKinds) {
      const map = this.collection[kind] as Map<string, DecodeLineReturn<typeof kind>>;
      recordGenerator[kind] = this.createRecordGenerator(kind, map);
    }

    // Export localization records
    const l10nMap = this.collection[ACRecordKind.L10N] as Map<LocalizationCode, Map<string, string>>;
    const localizationGenerator: AkashicCollectionLocalizationGenerator = {} as AkashicCollectionLocalizationGenerator;

    for (const locale of Object.values(LocalizationCode)) {
      const localeMap = l10nMap.get(locale);
      if (!localeMap) continue;
      localizationGenerator[locale] = this.createLocalizationGenerator(localeMap);
    }

    recordGenerator[ACRecordKind.L10N] = localizationGenerator;

    return recordGenerator as AkashicCollectionRecordGenerator;
  }

  private createRecordGenerator<K extends ReducedRecordKind>(
    kind: K,
    map: Map<string, DecodeLineReturn<K>>,
  ): AsyncGenerator<string> {
    const encoder = this.getEncoder(kind);
    return (async function* () {
      for (const record of map.values()) yield encoder(record);
    })();
  }

  private createLocalizationGenerator(map: Map<string, string>): AsyncGenerator<string> {
    return (async function* () {
      for (const [key, text] of map.entries()) yield localizationCodecs.encodeMapping({ key, text });
    })();
  }

  private getEncoder<K extends ReducedRecordKind>(kind: K): (record: DecodeLineReturn<K>) => string {
    switch (kind) {
      case ACRecordKind.ENUM:
        return (record) => elementCodecs.encodeEnum(record as ACREnum);
      case ACRecordKind.OBJ:
        return (record) => elementCodecs.encodeObject(record as ACRObject);
      case ACRecordKind.ERR:
        return (record) => errorCodecs.encode(record as ACRError);
      default:
        throw new Error(`Unsupported record kind for encoding: '${kind}'`);
    }
  }
}
