import { CObjectDefinition } from "@atlas/contracts";
import { ObjectAttribute } from "@atlas/enums";
import { ContractGenerator } from "@atlas/scaffold/Generator";

const dartConversion: Record<string, string> = {
  STRING: "String",
  NUMBER: "num",
  BOOLEAN: "bool",
} satisfies Record<ObjectAttribute, string>;

export class FlutterGenerator extends ContractGenerator {
  generateContract(definition: CObjectDefinition["ObjectDefinition"]) {
    const fileLines: string[] = [];
    const filename = `${definition.name}.dart`;
    fileLines.push(`class ${definition.name} {`);
    for (const [key, atrType] of Object.entries(definition.attributes))
      fileLines.push(`  ${key} ${dartConversion[atrType]};`);
    fileLines.push(`  ${definition.name}({`);
    for (const key of Object.keys(definition.attributes)) fileLines.push(`    required this.${key},`);
    fileLines.push(`  });`);
    fileLines.push(`}`);
    return { filename, fileData: fileLines.join("\n") };
  }
}
