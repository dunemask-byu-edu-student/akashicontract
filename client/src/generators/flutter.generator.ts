import { CObjectDefinition } from "@atlas/contracts";
import { ObjectAttribute } from "@atlas/enums";
import { ContractGenerator } from "@atlas/scaffold/Generator";

const dartConversion: Record<string, string> = {
  STRING: "String",
  NUMBER: "num",
  BOOLEAN: "bool",
} satisfies Record<ObjectAttribute, string>;

export class FlutterGenerator extends ContractGenerator {
  getFilename(definition: CObjectDefinition["ObjectDefinition"]) {
    return `${definition.name}.dart`;
  }

  generateContract(definition: CObjectDefinition["ObjectDefinition"]) {
    const fileLines: string[] = [];
    fileLines.push(`class ${definition.name} {`);
    for (const [key, atrType] of Object.entries(definition.attributes))
      fileLines.push(`  ${dartConversion[atrType]} ${key};`);
    fileLines.push(`  ${definition.name}({`);
    for (const key of Object.keys(definition.attributes)) fileLines.push(`    required this.${key},`);
    fileLines.push(`  });`);
    fileLines.push(`}`);
    return { filename: this.getFilename(definition), fileData: fileLines.join("\n") };
  }
}
