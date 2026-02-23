// API Models for Contracts

export interface ContractRequest {
  userId: string;
  branchName: string;
  dataType: string;
  data: any;
}

export interface ContractResponse {
  id: string;
  userId: string;
  branchName: string;
  dataType: string;
  data: any;
  updatedAt: string;
}
