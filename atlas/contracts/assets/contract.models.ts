// API Models for Contracts

export interface UpdateContractRequest {
  userId: string;
  dataType: string;
  data: any;
}

export interface GetContractRequest {
    branchName: string;
    dataType: string;
}

export interface ContractResponse {
  id: string;
  branchName: string;
  dataType: string;
  data: any;
  updatedAt: string;
}
