// API Models for Contracts

export interface Contract {
  id: string;
  name: string;
  userId: string;
  attributes: { [key: string]: string };
}

export interface ContractRequest {
  name: string;
  attributes: { [key: string]: string };
}