import { Injectable, MiddlewareConsumer } from "@nestjs/common";
import { NestMiddleware, RouteInfo } from "@nestjs/common/interfaces";
import { json, raw, Request, Response } from "express";

@Injectable()
export class JsonBodyMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: () => any) {
    json()(req, res, next);
  }
}

@Injectable()
export class RawBodyMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: () => any) {
    raw({ type: "*/*" })(req, res, next);
  }
}

export const applyRawBodyOnlyTo = (consumer: MiddlewareConsumer, ...rawBodyRoutes: (string | RouteInfo)[]) => {
  consumer
    .apply(RawBodyMiddleware)
    .forRoutes(...rawBodyRoutes)
    .apply(JsonBodyMiddleware)
    .exclude(...rawBodyRoutes)
    .forRoutes("*");
};
