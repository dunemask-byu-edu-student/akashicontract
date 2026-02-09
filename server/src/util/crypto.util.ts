import { genSalt, compare, hash } from "bcrypt";
import { createCipheriv, createDecipheriv, randomBytes, randomInt } from "node:crypto";
import CONFIG from "@akc/config";
import jwt from "jsonwebtoken";

const SENSITIVE_SALT = 14; // Used for hashing sensitive information
const TEXT_SALT = 10; // Used for the hashText function
const KEY_SALT = 5; // Used for the genKey function

export async function hashSensitive(plainTest: string): Promise<string> {
  const salt = await genSalt(SENSITIVE_SALT);
  return hash(plainTest, salt);
}

export async function hashText(plainText: string): Promise<string> {
  const salt = await genSalt(TEXT_SALT);
  return hash(plainText, salt);
}

export const compareHash = (plainText: string, hash: string) => compare(plainText, hash);

export const encryptData = (plainText: string) => {
  const secretKey = Buffer.from(CONFIG.CRYPTO.ENCRYPTION_SECRET_KEY, "hex"); // 32 bytes = 256 bits
  const initializationVector = Buffer.from(CONFIG.CRYPTO.ENCRYPTION_INITIAL_VECTOR, "hex"); // 16 bytes = 128 bits
  const cipher = createCipheriv(CONFIG.CRYPTO.ENCRYPTION_METHOD, secretKey, initializationVector);
  let encryptedData = cipher.update(plainText, "utf8", "hex");
  encryptedData += cipher.final("hex");
  return encryptedData;
};

export const decryptData = (encryptedData: string) => {
  const secretKey = Buffer.from(CONFIG.CRYPTO.ENCRYPTION_SECRET_KEY, "hex"); // 32 bytes = 256 bits
  const initializationVector = Buffer.from(CONFIG.CRYPTO.ENCRYPTION_INITIAL_VECTOR, "hex"); // 16 bytes = 128 bits
  const decipher = createDecipheriv(CONFIG.CRYPTO.ENCRYPTION_METHOD, secretKey, initializationVector);
  let decryptedData = decipher.update(encryptedData, "hex", "utf8");
  decryptedData += decipher.final("utf8");
  return decryptedData;
};

export async function genKey(data: string, keyLength = 10): Promise<string> {
  const salt = await genSalt(KEY_SALT);
  const hashedData = await hash(data, salt);
  return hashedData.replace(/[^\w\s]/gi, "").slice(-keyLength);
}

export async function generatePassword(length: number, charset?: string) {
  const chars = charset ?? "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()-=_+";
  const passwordChunks: string[] = new Array(length).fill("a");
  const randomBytesBuffer = randomBytes(Math.ceil((length * 3) / 4));
  const base = randomBytesBuffer.toString("base64"); // We'll pull the character from this, but this forces ANSI characters
  const processChunk = (_v: string, i: number) => chars.charAt(Math.floor((base.charCodeAt(i) * chars.length) / 256));
  return passwordChunks.map(processChunk).join("");
}

export async function signJwt(
  payload: string | Buffer | object,
  key: jwt.Secret,
  opt?: jwt.SignOptions,
): Promise<string> {
  return new Promise((res, rej) =>
    jwt.sign(payload, key, opt as any, (err, token) => (err ? rej(err) : res(token as string))),
  );
}

export async function verifyJwt(token: string, key: jwt.Secret): Promise<string | jwt.JwtPayload | undefined> {
  return new Promise((res, _rej) => jwt.verify(token, key, (err, decoded) => (err ? res(undefined) : res(decoded))));
}

export const generatePin = (length: number): string => randomInt(10 ** (length - 1), 10 ** length).toString();

/**
 * Generate a RabbID (This function matches the postgres function that does the same thing)
 * @param prefix Prefix for the ID to return
 * @returns a UUID7 variant that includes a prefix with an underscore: <prefix>_019688b6cdae7dd884e3fa991cce2f11 for example
 */
export function generateRabbId(prefix: string): string {
  const timestamp = BigInt(Date.now()); // milliseconds since epoch
  const timestampBuffer = Buffer.alloc(6);
  timestampBuffer.writeUIntBE(Number(timestamp & 0xfffffffffffn), 0, 6); // last 6 bytes

  const randomBytes = crypto.getRandomValues(new Uint8Array(10));
  const uuidBytes = new Uint8Array(16);

  // Copy timestamp (6 bytes) + random (10 bytes)
  uuidBytes.set(timestampBuffer, 0);
  uuidBytes.set(randomBytes, 6);

  // Set UUID version to 7 (first 4 bits of byte 6)
  uuidBytes[6] = (uuidBytes[6] & 0x0f) | 0x70;

  // Set UUID variant to RFC 4122 (first 2 bits of byte 8)
  uuidBytes[8] = (uuidBytes[8] & 0x3f) | 0x80;

  // Convert to hex string
  const hex = Array.from(uuidBytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  // Remove dashes and add prefix
  return `${prefix}_${hex}`;
}
