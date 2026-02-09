import { BadRequestException } from "@nestjs/common";
import { apiClient } from "@atlas/scaffold/ApiClient";

/**
 * Converts Date properties of an object type to number.
 */
type DateToUnix<T> = {
  [K in keyof T]: T[K] extends infer U ? (U extends Date ? number : U) : never;
};

/**
 * Processes a large array of inputs by splitting them into smaller chunks and
 * executing a batch action on each chunk. This is useful for rate-limiting
 * or managing API calls.
 *
 * @template T The type of the elements in the input array.
 * @template K The type of the elements in the returned result array.
 * @param {T[]} allInputs The complete array of inputs to be processed.
 * @param {number} chunkSize The number of items to process in each batch.
 * @param {(chunk: T[]) => Promise<K[]>} batchAction The asynchronous function that processes a chunk of inputs and returns a promise with the results for that chunk.
 * @returns {Promise<K[]>} A promise that resolves to a single array containing all the results from every batch in their original order.
 */
export async function batchRequests<T, K>(
  allInputs: T[],
  chunkSize: number,
  batchAction: (chunk: T[]) => Promise<K[]>,
): Promise<K[]> {
  const results = new Array(allInputs.length).fill(undefined) as K[];
  for (let i = 0; i < allInputs.length; i += chunkSize) {
    const chunk = allInputs.slice(i, i + chunkSize);
    const batchResults = await batchAction(chunk);
    for (let j = 0; j < batchResults.length; j++) results[i + j] = batchResults[j];
  }
  return results;
}

/**
 * Processes a large array of inputs by splitting them into smaller chunks and
 * executing a batch action on each chunk. This is useful for rate-limiting
 * or managing API calls.
 *
 * @template T The type of the elements in the input array.
 * @template K The type of the elements in the returned result array.
 * @param {T[]} allInputs The complete array of inputs to be processed.
 * @param {number} chunkSize The number of items to process in each batch.
 * @param {(chunk: T[]) => Promise<K[]>} batchAction The asynchronous function that processes a chunk of inputs and returns a promise with the results for that chunk.
 * @returns {Promise<K[]>} A promise that resolves to a single array containing all the results from every batch in their original order.
 */
export async function batchAction<T, K>(
  allInputs: T[],
  chunkSize: number,
  batchAction: (input: T) => Promise<K>,
): Promise<K[]> {
  return batchRequests(allInputs, chunkSize, async (inputs) => Promise.all(inputs.map((input) => batchAction(input))));
}

/**
 * @param phoneNumber phone number to be formatted
 * @returns Formatted phone number in the E.164 standard
 */
export function formatPhoneNumber(phoneNumber: string) {
  // Define a regex pattern to match unwanted characters
  const regex = /[ ()+\-.]/g;
  const formatted = phoneNumber.replace(regex, "");
  if (isNaN(parseInt(formatted))) throw new BadRequestException(`Unparseable phone number '${phoneNumber}'`);
  if (formatted.length === 10) return `+1${formatted}`;
  return `+${formatted}`;
}

/**
 * Generates a random "slug" generally 11-13 characters in length of [0-9] & [a-z]
 * @returns a random "slug" generally 11-13 characters [0-9] & [a-z]
 */
export const randomSlug = () => Math.random().toString(36).substring(2);

/**
 * Get the first and last name of a user
 * @param fullName Name to section pieces of
 * @returns firstName and lastName of a full name
 */
export function splitName(name: string): { firstName: string; lastName: string } {
  const nameParts = name.trim().split(" ");
  if (nameParts.length === 1) return { firstName: nameParts[0], lastName: "" };
  return { firstName: nameParts[0], lastName: nameParts.slice(1).join(" ") };
}

/**
 * @param text Text to JSON parse
 * @returns a promise the parsed JSON object
 */
export const asyncJSONParse = async (text: string) => JSON.parse(text);

export const nullableJSONParse = (text: string): any | null => {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
};

/**
 * Basic JSON post method
 * @param url URL to make a request to
 * @param json JSON object to send to the server
 * @returns the fetch response of the request
 */
export const jsonPost = (url: string, json: object) => apiClient({ endpoint: url }).post().json(json).exec();

/**
 * Timeout of a promise to reject. Use with Promise.race to timeout if actions take too long
 * @param t Time in milliseconds before the timeout should trigger
 * @param err Error to throw at the end of the timeout
 * @example
 *  const timeout = timeoutPromise(15000, new Error("Timeout: took longer than 15 seconds"));
    const actualData = await Promise.race([this.someActualData(), timeout]); // Will Error if it takes longer than 15 seconds
 */
export const timeoutPromise = (t: number, err?: Error) =>
  new Promise<never>((_, reject) => setTimeout(() => reject(err ?? new Error("Timeout expired!")), t));

/**
 * Converts all Date properties of an object into Unix timestamps (milliseconds).
 *
 * @param obj - The input object
 * @returns A new object where Date values are replaced with numbers
 *
 */
export function objectDateToUnix<T extends Record<string, any>>(obj: T): DateToUnix<T> {
  const result = {} as DateToUnix<T>;
  for (const key in obj) {
    const value = obj[key] as T[keyof T];
    result[key] = (
      (value as unknown) instanceof Date ? (value.getTime() as number) / 1000 : value
    ) as DateToUnix<T>[keyof T];
  }
  return result;
}
