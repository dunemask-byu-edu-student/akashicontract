// API Models for Contracts

export interface Contract {
  id: string;
  name: string;
  attributes: Array<Record<string, string>>;
}

export interface GetContractRequest {
    id: string;
}
