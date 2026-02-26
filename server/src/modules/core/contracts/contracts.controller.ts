import { Controller, Post, Get, Body, Query, UseGuards, Put, Delete } from "@nestjs/common";
import { ContractsService } from "./contracts.service";
import { Contract } from "@atlas/contracts";
import { ResourcePolicyGuard } from "../../../util/nest-extras/resource-policy.guard";
import { AtlasPolicyMap } from "@atlas/enums";

@UseGuards(ResourcePolicyGuard([AtlasPolicyMap.IAM_Root.ROOT.SELF]))
@Controller('contracts')
export class ContractsController {
  constructor(private readonly contractsService: ContractsService) {}

  @Get()
  async getContract(
    @Query('id') id: string,
  ): Promise<Contract | null> {
    return await this.contractsService.getContract(id);
  }

  @Post()
  async createContract(
    @Body() body: Contract,
  ): Promise<Contract> {
    return await this.contractsService.createContract(body);
  }

  @Put()
  async updateContract(
    @Body() body: Contract,
  ): Promise<Contract> {
    return await this.contractsService.updateContract(body);
  }

  @Delete()
  async deleteContract(
    @Query('id') id: string,
  ): Promise<void> {
    return await this.contractsService.deleteContract(id);
  }

}