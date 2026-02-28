import { CObjectDefinition } from "@atlas/contracts";
import { ContractGenerator } from "@atlas/scaffold/Generator";

export class TypescriptGenerator extends ContractGenerator {
  generateContract(definition: CObjectDefinition["ObjectDefinition"]) {
    const fileLines: string[] = [];
    const filename = `${definition.name}.ts`;
    fileLines.push(`export interface ${definition.name} {`);
    for (const [key, atrType] of Object.entries(definition.attributes)) fileLines.push(`  ${key}: ${atrType}`);
    fileLines.push(`}`);
    return { filename, fileData: fileLines.join("\n") };
  }
}
