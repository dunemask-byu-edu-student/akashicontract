import { PostgresService } from "@akc/modules/common/postgres/postgres.service";
import { Injectable } from "@nestjs/common";
import { CObjectDefinition, ObjectDefinition } from "@atlas/contracts";
import { ContractsSocketService } from "./contracts-sockets.service";

@Injectable()
export class ContractsService {
  constructor(
    private readonly postgresService: PostgresService,
    private readonly socketService: ContractsSocketService, // No more Gateway dependency!
  ) {}

  async getContract(id: string): Promise<CObjectDefinition["ObjectDefinition"]> {
    const contractResponse = await this.postgresService.contract.findUniqueOrThrow({ where: { id } });
    return ObjectDefinition.ObjectDefinition.validate(contractResponse);
  }

  async getContracts(userId: string, page: number, pageSize: number): Promise<CObjectDefinition["ObjectDefinition"][]> {
    const offset = (page - 1) * pageSize;
    const contractResponse = await this.postgresService.contract.findMany({
      where: { userId },
      skip: offset,
      take: pageSize,
    });
    return contractResponse.map((c) => ObjectDefinition.ObjectDefinition.validateSync(c));
  }

  async createContract(
    contractRequest: CObjectDefinition["CreateObjectDefinition"],
  ): Promise<CObjectDefinition["ObjectDefinition"]> {
    const contractResponse = await this.postgresService.contract.create({ data: { ...contractRequest, userId: "1" } });
    const objDef = await ObjectDefinition.ObjectDefinition.validate(contractResponse);
    this.socketService.sendContractSet(objDef);
    return objDef;
  }

  async updateContract(
    data: CObjectDefinition["ObjectDefinition"],
    id: string,
  ): Promise<CObjectDefinition["ObjectDefinition"]> {
    const updatedDef = await this.postgresService.contract.update({ where: { id }, data: { ...data, userId: "1" } });
    const objDef = await ObjectDefinition.ObjectDefinition.validate(updatedDef);
    this.socketService.sendContractSet(objDef);
    return objDef;
  }

  async deleteContract(id: string): Promise<void> {
    await this.postgresService.contract.delete({ where: { id } });
    this.socketService.sendContractDelete(id);
  }
}
