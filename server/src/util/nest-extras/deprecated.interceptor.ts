import { Request, Response } from "express";
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  UseInterceptors,
  InternalServerErrorException,
  applyDecorators,
  SetMetadata,
} from "@nestjs/common";
import { Observable } from "rxjs";
import { tap } from "rxjs/operators";
import { LOG } from "@akc/logging";

declare type Sunset = `${number}-${number}-${number}`;
export const DEPRECATED_FLAG = "DEPRECATED_FLAG" as const;

@Injectable()
class DeprecationInterceptor implements NestInterceptor {
  private readonly sunsetDate?: Date;
  constructor(
    private readonly reason = "This endpoint is deprecated.",
    sunset?: Sunset,
    private readonly link?: string,
  ) {
    if (sunset) {
      try {
        const parsed = new Date(sunset);
        if (isNaN(parsed.getTime())) throw new Error("Invalid date string");
        this.sunsetDate = parsed;
      } catch (err) {
        throw new InternalServerErrorException(`Invalid sunset date provided to @Deprecated: ${sunset}`);
      }
    }
  }

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const response = context.switchToHttp().getResponse() as Response;
    const request = context.switchToHttp().getRequest() as Request;
    const routePath = request.route ? request.route.path : "Unknown route";

    response.setHeader("Deprecated", "true");
    response.setHeader("Deprecated-Reason", this.reason);
    if (!!this.sunsetDate) response.setHeader("Deprecated-Sunset", this.sunsetDate.toUTCString());
    if (!!this.link) response.setHeader("Deprecation-Link", `<${this.link}>; rel="alternate"`);

    return next.handle().pipe(
      tap(() => {
        LOG.sillyTag("DEPRECATION", `Deprecated endpoint '${routePath}' called!`);
      }),
    );
  }
}

export const Deprecated = (msg?: string, sunset?: Sunset, link?: string) =>
  applyDecorators(SetMetadata(DEPRECATED_FLAG, sunset), UseInterceptors(new DeprecationInterceptor(msg, sunset, link)));
