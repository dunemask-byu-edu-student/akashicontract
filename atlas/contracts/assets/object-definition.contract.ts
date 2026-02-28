// Imports
import { ObjectAttribute } from "@atlas/enums";
import { ContractTypeDefinitions, defineContractExport, valueRecord } from "@atlas/scaffold/ContractDefinitions";
import { object, string } from "yup";
const contractName = "ObjectDefinition";

// ====================================== Reused Contracts ======================================

// ====================================== Response Contracts ======================================

export const Responses = defineContractExport(`${contractName}ContractRes`, {});

// ====================================== Request Contracts ======================================

export const Requests = defineContractExport(`${contractName}ContractReq`, {
  ObjectDefinition: object({
    id: string().required(),
    name: string().required(),
    userId: string().required(),
    attributes: valueRecord(Object.values(ObjectAttribute)),
  }),
  CreateObjectDefinition: object({
    name: string().required(),
    attributes: valueRecord(Object.values(ObjectAttribute)),
  }),
});

// ====================================== Combined Declarations ======================================

export const Contract = defineContractExport(`${contractName}Contract`, { ...Responses, ...Requests });

// ====================================== Type Declarations ======================================

export type CContractRes = ContractTypeDefinitions<typeof Responses>;
export type CContractReq = ContractTypeDefinitions<typeof Requests>;
export type CContract = ContractTypeDefinitions<typeof Contract>;
