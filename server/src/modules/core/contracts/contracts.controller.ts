import { Controller, Post, Get, Body, Query, UseGuards, Put, Delete, Param } from "@nestjs/common";
import { ContractsService } from "./contracts.service";
import { ResourcePolicyGuard } from "../../../util/nest-extras/resource-policy.guard";
import { AtlasPolicyMap } from "@atlas/enums";
import { CObjectDefinition } from "@atlas/contracts";

@UseGuards(ResourcePolicyGuard([AtlasPolicyMap.IAM_Root.ROOT.SELF]))
@Controller("/api/contracts/objects")
export class ContractsController {
  constructor(private readonly contractsService: ContractsService) {}

  @Get("/:id")
  async getContract(@Param("id") id: string): Promise<CObjectDefinition["ObjectDefinition"] | null> {
    return this.contractsService.getContract(id);
  }

  @Get("/")
  async getContracts(
    @Query("page") page?: string,
    @Query("pageSize") pageSize?: string,
  ): Promise<CObjectDefinition["ObjectDefinition"][]> {
    const currentPage = page ? parseInt(page, 10) : 1;
    const currentPageSize = pageSize ? parseInt(pageSize, 10) : 5;
    return this.contractsService.getContracts("1", currentPage, currentPageSize);
  }

  @Post("/")
  async createContract(
    @Body() body: CObjectDefinition["CreateObjectDefinition"],
  ): Promise<CObjectDefinition["ObjectDefinition"]> {
    return this.contractsService.createContract(body);
  }

  @Put("/:id")
  async updateContract(
    @Body() body: CObjectDefinition["ObjectDefinition"],
    @Param("id") id: string,
  ): Promise<CObjectDefinition["ObjectDefinition"]> {
    return this.contractsService.updateContract(body, id);
  }

  @Delete("/:id")
  async deleteContract(@Param("id") id: string): Promise<void> {
    return this.contractsService.deleteContract(id);
  }
}
