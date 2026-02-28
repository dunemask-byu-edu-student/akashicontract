import { CObjectDefinition } from "@atlas/contracts";
import { ObjectAttribute } from "@atlas/enums";
import { ContractGenerator } from "@atlas/scaffold/Generator";

const conversionTable: Record<string, string> = {
  STRING: "string",
  NUMBER: "number",
  BOOLEAN: "boolean",
} satisfies Record<ObjectAttribute, string>;

export class TypescriptGenerator extends ContractGenerator {
  getFilename(definition: CObjectDefinition["ObjectDefinition"]) {
    return `${definition.name}.ts`;
  }

  generateContract(definition: CObjectDefinition["ObjectDefinition"]) {
    const fileLines: string[] = [];
    fileLines.push(`export interface ${definition.name} {`);
    for (const [key, atrType] of Object.entries(definition.attributes))
      fileLines.push(`  ${key}: ${conversionTable[atrType]};`);
    fileLines.push(`}`);
    return { filename: this.getFilename(definition), fileData: fileLines.join("\n") };
  }
}
