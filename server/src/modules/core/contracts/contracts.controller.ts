import { Controller, Post, Get, Body, Query, UseGuards, Put, Delete, Param } from "@nestjs/common";
import { ContractsService } from "./contracts.service";
import { Contract, ContractRequest } from "@atlas/contracts";
import { ResourcePolicyGuard } from "../../../util/nest-extras/resource-policy.guard";
import { AtlasPolicyMap } from "@atlas/enums";

@UseGuards(ResourcePolicyGuard([AtlasPolicyMap.IAM_Root.ROOT.SELF]))
@Controller('contracts')
export class ContractsController {
  constructor(private readonly contractsService: ContractsService) {}

  @Get(':id')
  async getContract(
    @Param('id') id: string,
  ): Promise<Contract | null> {
    return await this.contractsService.getContract(id);
  }

  @Get()
  async getContracts(
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ): Promise<Contract[]> {
    const currentPage = page ? parseInt(page, 10) : 1;
    const currentPageSize = pageSize ? parseInt(pageSize, 10) : 5;
    return await this.contractsService.getContracts("1", currentPage, currentPageSize);
  }

  @Post()
  async createContract(
    @Body() body: ContractRequest,
  ): Promise<Contract> {
    return await this.contractsService.createContract(body);
  }

  @Put()
  async updateContract(
    @Body() body: ContractRequest,
    @Query('id') id: string,
  ): Promise<Contract> {
    return await this.contractsService.updateContract(body, id);
  }

  @Delete()
  async deleteContract(
    @Query('id') id: string,
  ): Promise<void> {
    return await this.contractsService.deleteContract(id);
  }

}