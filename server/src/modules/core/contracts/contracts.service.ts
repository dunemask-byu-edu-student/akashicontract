import { PostgresService } from "@akc/modules/common/postgres/postgres.service";
import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { Contract, ContractRequest } from "src/atlas/contracts/assets/contract.models";

@Injectable()
export class ContractsService {
  constructor(private readonly postgresService: PostgresService) {}

  async getContract(id: string): Promise<Contract | null> {
    const contractResponse = await this.postgresService.contracts.findUniqueOrThrow({ where: { id } });
    if (!this.isStringMap(contractResponse.attributes)) throw new Error("Invalid contract attributes format");
    return { ...contractResponse, attributes: contractResponse.attributes };
  }

  async getContracts(userId: string, page: number, pageSize: number): Promise<Contract[]> {
    const offset = (page - 1) * pageSize;
    const contractResponse =  await this.postgresService.contracts.findMany({where: { userId }, skip: offset, take: pageSize});
    return contractResponse.map(contract => {
      if (!this.isStringMap(contract.attributes)) throw new Error("Invalid contract attributes format");
      return { ...contract, attributes: contract.attributes };
    });
  }

  async createContract(contractRequest: ContractRequest): Promise<Contract> {
    const contractResponse = await this.postgresService.contracts.create({data: {...contractRequest, userId: "1"}});
    if (!this.isStringMap(contractResponse.attributes)) throw new Error("Invalid contract attributes format");
    return { ...contractResponse, attributes: contractResponse.attributes };
  }

  async updateContract(contractRequest: ContractRequest, id: string): Promise<Contract> {
    const contractResponse = await this.postgresService.contracts.update({where: { id }, data: {...contractRequest, userId: "1"}});
    if (!this.isStringMap(contractResponse.attributes)) throw new Error("Invalid contract attributes format");
    return { ...contractResponse, attributes: contractResponse.attributes };
  }

  async deleteContract(id: string): Promise<void> {
    await this.postgresService.contracts.delete({ where: { id } });
  }

  private isStringMap(obj: unknown): obj is { [key: string]: string } {
    return (typeof obj === "object" && obj !== null && Object.values(obj).every(value => typeof value === "string"));
  }
}