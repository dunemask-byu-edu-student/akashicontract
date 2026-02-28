import { CObjectDefinition } from "@atlas/contracts";
import { ContractGenerator } from "@atlas/scaffold/Generator";

export class TypescriptGenerator extends ContractGenerator {
  getFilename(definition: CObjectDefinition["ObjectDefinition"]) {
    return `${definition.name}.ts`;
  }

  generateContract(definition: CObjectDefinition["ObjectDefinition"]) {
    const fileLines: string[] = [];
    fileLines.push(`export interface ${definition.name} {`);
    for (const [key, atrType] of Object.entries(definition.attributes)) fileLines.push(`  ${key}: ${atrType}`);
    fileLines.push(`}`);
    return { filename: this.getFilename(definition), fileData: fileLines.join("\n") };
  }
}
