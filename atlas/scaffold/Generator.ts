import { CObjectDefinition } from "@atlas/contracts";
import fs from "node:fs";
import path from "node:path";

interface LanguageContractContext {
  filename: string;
  fileData: string;
}

export abstract class ContractGenerator {
  constructor(protected readonly outputDirectory: string) {}
  abstract generateContract(definition: CObjectDefinition["ObjectDefinition"]): LanguageContractContext;
  abstract getFilename(definition: CObjectDefinition["ObjectDefinition"]): string;

  getFilepath(definition: CObjectDefinition["ObjectDefinition"]) {
    return path.join(this.outputDirectory, this.getFilename(definition));
  }

  async writeContract(definition: CObjectDefinition["ObjectDefinition"]) {
    await fs.promises.mkdir(this.outputDirectory, { recursive: true });
    const { fileData } = this.generateContract(definition);
    await fs.promises.writeFile(this.getFilepath(definition), fileData);
  }

  async deleteContract(definition: CObjectDefinition["ObjectDefinition"]) {
    const filepath = this.getFilepath(definition);
    if (fs.existsSync(filepath)) await fs.promises.rm(filepath);
  }

  async generateContracts(contracts: CObjectDefinition["ObjectDefinition"][]) {
    if (fs.existsSync(this.outputDirectory)) await fs.promises.rm(this.outputDirectory, { recursive: true });
    await fs.promises.mkdir(this.outputDirectory, { recursive: true });
    for (const c of contracts) {
      const { filename, fileData } = this.generateContract(c);
      await fs.promises.writeFile(path.resolve(this.outputDirectory, filename), fileData);
    }
  }
}
