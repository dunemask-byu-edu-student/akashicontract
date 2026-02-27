import { PostgresService } from "@akc/modules/common/postgres/postgres.service";
import { BadRequestException, Injectable } from "@nestjs/common";
import { Contract, ContractRequest } from "src/atlas/contracts/assets/contract.models";
import { ContractsGateway } from "./contracts.gateway";

@Injectable()
export class ContractsService {
  constructor(
    private readonly postgresService: PostgresService,
    private readonly contractsGateway: ContractsGateway,
  ) {}

  async getContract(id: string): Promise<Contract | null> {
    const contractResponse = await this.postgresService.contracts.findUniqueOrThrow({ where: { id } });
    if (!this.isStringMap(contractResponse.attributes)) throw new BadRequestException("Invalid contract attributes format");
    return { ...contractResponse, attributes: contractResponse.attributes };
  }

  async getContracts(userId: string, page: number, pageSize: number): Promise<Contract[]> {
    const offset = (page - 1) * pageSize;
    const contractResponse =  await this.postgresService.contracts.findMany({where: { userId }, skip: offset, take: pageSize});
    return contractResponse.map(contract => {
      if (!this.isStringMap(contract.attributes)) throw new BadRequestException("Invalid contract attributes format");
      return { ...contract, attributes: contract.attributes };
    });
  }

  async createContract(contractRequest: ContractRequest): Promise<Contract> {
    const contractResponse = await this.postgresService.contracts.create({data: {...contractRequest, userId: "1"}});
    if (!this.isStringMap(contractResponse.attributes)) throw new BadRequestException("Invalid contract attributes format");
    const contract = { ...contractResponse, attributes: contractResponse.attributes };
    this.contractsGateway.sendContractSet(contract);
    return contract;
  }

  async updateContract(contractRequest: ContractRequest, id: string): Promise<Contract> {
    const contractResponse = await this.postgresService.contracts.update({where: { id }, data: {...contractRequest, userId: "1"}});
    if (!this.isStringMap(contractResponse.attributes)) throw new BadRequestException("Invalid contract attributes format");
    const contract = { ...contractResponse, attributes: contractResponse.attributes };
    this.contractsGateway.sendContractSet(contract);
    return contract;
  }

  async deleteContract(id: string): Promise<void> {
    await this.postgresService.contracts.delete({ where: { id } });
    this.contractsGateway.sendContractDelete(id);
  }

  private isStringMap(obj: unknown): obj is { [key: string]: string } {
    return (typeof obj === "object" && obj !== null && Object.values(obj).every(value => typeof value === "string"));
  }
}