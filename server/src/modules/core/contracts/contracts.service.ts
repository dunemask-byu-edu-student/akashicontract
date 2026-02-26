import { PostgresService } from "@akc/modules/common/postgres/postgres.service";
import { Injectable } from "@nestjs/common";
import { Contract } from "src/atlas/contracts/assets/contract.models";

@Injectable()
export class ContractsService {
  constructor(private readonly postgresService: PostgresService) {}

  async getContract(id: string): Promise<Contract | null> {
    return await this.postgresService.contracts.findUnique({ where: { id } });
  }

  async createContract(req: Contract): Promise<Contract> {
    return await this.postgresService.contracts.create({
      data: {
        id: req.id,
        userId: "1",
        name: req.name,
        attributes: req.attributes,
      },
    });
  }

  async updateContract(req: Contract): Promise<Contract> {
    return await this.postgresService.contracts.update({
      where: { id: req.id },
      data: {
        name: req.name,
        attributes: req.attributes,
      },
    });
  }

  async deleteContract(id: string): Promise<void> {
    await this.postgresService.contracts.delete({ where: { id } });
  }

}