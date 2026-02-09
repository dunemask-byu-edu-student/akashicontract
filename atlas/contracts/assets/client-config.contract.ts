// Imports
import { LocaleCodes } from "@atlas/enums";
import { ContractTypeDefinitions, defineContractExport } from "@atlas/scaffold/ContractDefinitions";
import { object, string, array } from "yup";
const contractName = "ClientConfig";

// ====================================== Reused Contracts ======================================

// ====================================== Response Contracts ======================================

export const Responses = defineContractExport(`${contractName}ContractRes`, {});

// ====================================== Request Contracts ======================================

export const Requests = defineContractExport(`${contractName}ContractReq`, {
  ClientConfig: object({
    recordInstance: string().required(),
    recordRef: string().required(),
    l10nCodes: array(string().required().oneOf(Object.values(LocaleCodes)))
      .optional()
      .min(1)
      .default([LocaleCodes.En]),
    l10nPaths: array(string().required()).optional().default(["*"]),
  }).required(),
});

// ====================================== Combined Declarations ======================================

export const Contract = defineContractExport(`${contractName}Contract`, { ...Responses, ...Requests });

// ====================================== Type Declarations ======================================

export type CContractRes = ContractTypeDefinitions<typeof Responses>;
export type CContractReq = ContractTypeDefinitions<typeof Requests>;
export type CContract = ContractTypeDefinitions<typeof Contract>;
