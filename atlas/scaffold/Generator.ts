import { CObjectDefinition } from "@atlas/contracts";
import fs from "node:fs";
import path from "node:path";

interface LanguageContractContext {
  filename: string;
  fileData: string;
}

export abstract class ContractGenerator {
  constructor(private readonly outputDirectory: string) {}
  abstract generateContract(definition: CObjectDefinition["ObjectDefinition"]): LanguageContractContext;

  async generateContracts(contracts: CObjectDefinition["ObjectDefinition"][]) {
    if (fs.existsSync(this.outputDirectory)) await fs.promises.rm(this.outputDirectory, { recursive: true });
    await fs.promises.mkdir(this.outputDirectory, { recursive: true });
    for (const c of contracts) {
      const { filename, fileData } = this.generateContract(c);
      await fs.promises.writeFile(path.resolve(this.outputDirectory, filename), fileData);
    }
  }
}
