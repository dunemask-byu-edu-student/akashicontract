import { PostgresService } from "@akc/modules/common/postgres/postgres.service";
import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { Contract, ContractRequest } from "src/atlas/contracts/assets/contract.models";

@Injectable()
export class ContractsService {
  constructor(private readonly postgresService: PostgresService) {}

  async getContract(id: string): Promise<Contract | null> {
    const res: Contract | null = await this.postgresService.contracts.findUnique({ where: { id } });
    if (!res) {
      throw new NotFoundException(`Contract with id ${id} not found`);
    }
    return res;
  }

  async getContracts(userId: string, page: number, pageSize: number): Promise<Contract[]> {
    const offset = (page - 1) * pageSize;
    return await this.postgresService.contracts.findMany({
      where: { userId },
      skip: offset,
      take: pageSize,
    });
  }

  async createContract(contractRequest: ContractRequest): Promise<Contract> {
    try {
      return await this.postgresService.contracts.create({
        data: {
          ...contractRequest,
          userId: "1",
        }
      });
    } catch (error) {
      if (error instanceof Error) {
        throw new BadRequestException(error.message);
      }
      throw new BadRequestException('An unknown error occurred');
    }
  }

  async updateContract(contractRequest: ContractRequest, id: string): Promise<Contract> {
    try {
      return await this.postgresService.contracts.update({
        where: { id },
        data: {
          ...contractRequest,
          userId: "1",
        },
      });
    } catch (error) {
      if (error instanceof Error) {
        throw new BadRequestException(error.message);
      }
      throw new BadRequestException('An unknown error occurred');
    }
  }

  async deleteContract(id: string): Promise<void> {
    await this.postgresService.contracts.delete({ where: { id } });
  }

}