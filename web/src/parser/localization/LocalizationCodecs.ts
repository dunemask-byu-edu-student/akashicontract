import {
  ACLocalizationDeltaTarget,
  ACLocalizationDeltaTargetLocale,
  ACRLocalization,
  LocalizationCode,
} from "./LocalizationCommon";

enum CodecTokens {
  PARTS = ":",
}

const supportedLocales = Object.values(LocalizationCode);

export class LocalizationCodecs {
  encodeDeltaTarget(localization: ACLocalizationDeltaTarget): string {
    const encodedValues = [localization.locale, localization.key];
    return encodedValues.join(CodecTokens.PARTS);
  }

  decodeDeltaTarget(encodedLocalization: string): ACLocalizationDeltaTarget {
    const encodedValueParts = encodedLocalization.split(CodecTokens.PARTS);
    if (encodedValueParts.length !== 2) throw new Error(`Invalid encoded value part length!`);
    const [localeString, key] = encodedValueParts;
    const locale = localeString as ACLocalizationDeltaTargetLocale;
    const allKeys = locale === "*";
    if (!allKeys && !supportedLocales.includes(locale)) throw new Error(`Invalid locale selector`);
    return { locale, key };
  }

  encodeMapping(mapping: ACRLocalization): string {
    const encodedValues = [mapping.key, mapping.text];
    return encodedValues.join(CodecTokens.PARTS);
  }

  decodeMapping(encodedMapping: string): ACRLocalization {
    const encodedParts = encodedMapping.split(CodecTokens.PARTS);
    if (encodedParts.length !== 2) throw new Error(`Invalid name mapping '${encodedMapping}'`);
    const [key, text] = encodedParts;
    return { key, text };
  }
}
