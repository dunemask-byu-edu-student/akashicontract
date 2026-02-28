import { FlutterGenerator } from "./flutter.generator";
import { TypescriptGenerator } from "./typescript.generator";

export function getGeneratorClass(language: string) {
  if (language === "typescript") return TypescriptGenerator;
  if (language === "flutter") return FlutterGenerator;
  throw new Error(`Could not find a valid generator for the language '${language}'`);
}
