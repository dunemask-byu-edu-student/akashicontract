import { ApiClientError, SerializedApiClientError, SerializedApiClientErrorSchema } from "@atlas/scaffold/ApiClient";
import { LOG } from "@akc/logging";
import { ExceptionFilter, Catch, ArgumentsHost, HttpException } from "@nestjs/common";
import type { Request, Response } from "express";
import * as y from "yup";

const ExtendedHttpExceptionSchema = y.object({
  message: y.string().required(),
  error: y.string().optional(),
  statusCode: y.number().required().integer().positive(),
});

@Catch()
export class ApiClientExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse<Response>();
    const req = ctx.getRequest<Request>();
    if (exception instanceof ApiClientError) return this.catchApiClientError(req, res, exception);
    if (exception instanceof HttpException) return this.catchKnownException(req, res, exception);
    else if (exception instanceof Error) return this.catchUnknownException(req, res, exception);
    else this.catchUnknown(req, res, exception);
  }

  catchApiClientError(req: Request, res: Response, clientError: ApiClientError) {
    clientError.location = clientError.location ?? req.path;
    return res.status(clientError.httpStatus).json(clientError.serialize());
  }

  catchKnownException(req: Request, res: Response, exception: HttpException) {
    const loc = req.path;
    const status = exception.getStatus();
    const data = exception.getResponse();
    const timestamp = Math.floor(Date.now() / 1000);
    if (typeof data === "string")
      return res.status(status).json({ code: `HTTP:${status}`, status, msg: data, loc, ts: timestamp });

    const isExtended = ExtendedHttpExceptionSchema.isValidSync(data);
    const isSerialized = SerializedApiClientErrorSchema.isValidSync(data);
    if (isSerialized) return res.status(status).json(data);
    const apiClientError = { code: `HTTP:${status}`, status, loc, ts: timestamp };
    if (isExtended) return res.status(status).json({ ...apiClientError, msg: data.message ?? exception.name });
    return res.status(status).json({ ...apiClientError, msg: exception.name, data });
  }

  catchUnknownException(req: Request, res: Response, exception: Error) {
    LOG.fatal(exception.stack);
    const error: SerializedApiClientError = {
      code: `HTTP:500`,
      status: 500,
      msg: exception.name,
      loc: req.path,
      detail: exception.message,
      ts: Math.floor(Date.now() / 1000),
    };
    res.status(500).json(error);
  }

  catchUnknown(req: Request, res: Response, unknown: unknown) {
    LOG.fatalTag("UNKONWN EXCEPTION", unknown);
    const error: SerializedApiClientError = {
      code: `HTTP:500`,
      status: 500,
      msg: "Fatal Unknown Exception",
      loc: req.path,
      ts: Math.floor(Date.now() / 1000),
    };
    res.status(500).json(error);
  }
}
