import * as y from "yup";

export function asPaginated<T extends y.Schema<any>>(schema: T) {
  return y.object({
    items: y.array(schema.required()).required() as y.ArraySchema<y.InferType<T>[], y.AnyObject, undefined, "">,
    more: y.boolean().required(),
    next: y.string().nullable().defined(),
    prev: y.string().nullable().defined(),
  });
}
