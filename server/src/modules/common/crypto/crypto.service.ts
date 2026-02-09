import { Injectable } from "@nestjs/common";
import jwt from "jsonwebtoken";

// Options
const asymmetricOpt: jwt.SignOptions = { algorithm: "RS256" };

@Injectable()
export class CryptoService {
  constructor() {}

  private async signJwt(payload: string | Buffer | object, key: jwt.Secret, opt?: jwt.SignOptions): Promise<string> {
    return new Promise((res, rej) =>
      jwt.sign(payload, key, opt ?? {}, (err, token) => (err ? rej(err) : res(token as string))),
    );
  }

  private async verifyJwt(token: string, key: jwt.Secret): Promise<string | jwt.JwtPayload | undefined> {
    return new Promise((res, _rej) => jwt.verify(token, key, (err, decoded) => (err ? res(undefined) : res(decoded))));
  }
}
