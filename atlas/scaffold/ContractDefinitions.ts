import * as y from "yup";

export declare type ContractDefinitions = Record<string, y.Schema>;
export type ContractTypeDefinitions<IO extends ContractDefinitions> = { [K in keyof IO]: y.InferType<IO[K]> };
type MakeOptional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

export function defineContracts<T extends ContractDefinitions>(contracts: T) {
  const defs: ContractDefinitions = { ...contracts };
  Object.keys(defs).forEach((c) => (defs[c] = defs[c].meta({ contract: c })));
  return defs as T;
}

export function defineContractExport<T extends ContractDefinitions>(exportTypeName: string, contracts: T) {
  const defs: ContractDefinitions = { ...contracts };
  Object.keys(defs).forEach((c) => (defs[c] = defs[c].meta({ contract: c, contractExport: exportTypeName })));
  return defs as T;
}

export function asPartial<T extends y.ObjectSchema<any>, K extends keyof y.InferType<T>>(
  schema: T,
  keys: K[] = [],
): y.ObjectSchema<MakeOptional<y.InferType<T>, K>> {
  const fields = schema.fields as Record<string, y.Schema<any, any>>;

  const partial = Object.fromEntries(
    Object.entries(fields).map(([fieldName, fieldSchema]) => {
      if (keys.length === 0 || keys.includes(fieldName as K)) {
        return [fieldName, fieldSchema.optional()];
      }
      return [fieldName, fieldSchema];
    }),
  );

  return schema.shape(partial) as y.ObjectSchema<MakeOptional<y.InferType<T>, K>>;
}

export const valueRecord = <T extends string>(validValues: T[]) =>
  y.object().test("valid-attribute-types", `Each attribute value must be 'string' in ${validValues}`, (value) => {
    if (!value || typeof value !== "object") return false;
    for (const v of Object.values(value)) if (typeof v !== "string" || !validValues.includes(v as T)) return false;
    return true;
  }) as y.ObjectSchema<Record<string, T>>;

export const keyRecord = <T extends string>(validKeys: T[]) =>
  y.object().test("valid-attribute-types", `Each attribute key must be 'string' in ${validKeys}`, (value) => {
    if (!value || typeof value !== "object") return false;
    for (const key of Object.keys(value)) if (typeof key !== "string" || !validKeys.includes(key as T)) return false;
    return true;
  }) as y.ObjectSchema<Record<T, string>>;
