// API / DB Models for Contracts

export interface Contract {
  id: string;
  name: string;
  userId: string;
  attributes: any;
}

export interface ContractRequest {
  name: string;
  attributes: any;
}