// Imports
import { ContractTypeDefinitions, defineContractExport } from "@atlas/scaffold/ContractDefinitions";
import { object, string, array } from "yup";
const contractName = "Enum";

// ====================================== Reused Contracts ======================================

// ====================================== Response Contracts ======================================

export const Responses = defineContractExport(`${contractName}ContractRes`, {});

// ====================================== Request Contracts ======================================

export const Requests = defineContractExport(`${contractName}ContractReq`, {
  EnumDefinition: object({
    name: string().required(),
    description: string().optional(),
    values: array(string().required()).min(1).required(),
  }).required(),
});

// ====================================== Combined Declarations ======================================

export const Contract = defineContractExport(`${contractName}Contract`, { ...Responses, ...Requests });

// ====================================== Type Declarations ======================================

export type CContractRes = ContractTypeDefinitions<typeof Responses>;
export type CContractReq = ContractTypeDefinitions<typeof Requests>;
export type CContract = ContractTypeDefinitions<typeof Contract>;
