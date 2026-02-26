import { PostgresService } from "@akc/modules/common/postgres/postgres.service";
import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { Contract } from "src/atlas/contracts/assets/contract.models";

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

  async createContract(contract: Contract): Promise<Contract> {
    try {
      return await this.postgresService.contracts.create({
        data: contract
      });
    } catch (error) {
      if (error instanceof Error) {
        throw new BadRequestException(error.message);
      }
      throw new BadRequestException('An unknown error occurred');
    }
  }

  async updateContract(contract: Contract): Promise<Contract> {
    try {
      return await this.postgresService.contracts.update({
        where: { id: contract.id },
        data: contract,
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