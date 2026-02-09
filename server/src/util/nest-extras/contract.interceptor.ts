import { LOG } from "@akc/logging";
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  HttpException,
  HttpStatus,
  UseInterceptors,
} from "@nestjs/common";
import { catchError, Observable, map, throwError } from "rxjs";
import * as y from "yup";

declare type ContractDecs = MethodDecorator & ClassDecorator;
declare type ContractSchema = y.Schema;

@Injectable()
class ResponseContractInterceptor implements NestInterceptor {
  constructor(
    private contractSchema: ContractSchema,
    private ignoreError: boolean = false,
  ) {}
  intercept(context: ExecutionContext, next: CallHandler<any>): Observable<any> {
    return next.handle().pipe(
      map(async (data: any) => {
        const request = context.switchToHttp().getRequest();
        const routePath = request.route ? request.route.path : "Unknown route";
        try {
          await this.contractSchema.required().validate(data, { abortEarly: false });
          return data;
        } catch (error: any) {
          const validationError = error as y.ValidationError;
          const errorObj = { message: "Invalid response contract!", errors: validationError.errors, data };
          LOG.errorTag("ResponseContract", `${routePath}\n` + JSON.stringify(errorObj, null, 2));
          if (this.ignoreError) return data;
          throw new HttpException({ route: routePath, ...errorObj }, HttpStatus.INTERNAL_SERVER_ERROR);
        }
      }),
      catchError((err) => throwError(() => err)),
    );
  }
}

@Injectable()
class RequestContractInterceptor implements NestInterceptor {
  constructor(
    private contractSchema: ContractSchema,
    private ignoreError: boolean = false,
  ) {}
  async intercept(context: ExecutionContext, next: CallHandler<any>): Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest();
    const routePath = request.route ? request.route.path : "Unknown route";
    const body = request.body;
    try {
      // Validate request body
      await this.contractSchema.required().validate(body, { abortEarly: false });
      return next.handle();
    } catch (error: any) {
      const validationError = error as y.ValidationError;
      const errorObj = { message: "Invalid request contract!", errors: validationError.errors, body };
      LOG.errorTag("RequestContract", `${routePath}\n` + JSON.stringify(errorObj, null, 2));
      if (this.ignoreError) return next.handle();
      else throw new HttpException({ route: routePath, ...errorObj }, HttpStatus.BAD_REQUEST);
    }
  }
}

export function UseResponseContract(schema: ContractSchema, ignoreError?: boolean) {
  return UseInterceptors(new ResponseContractInterceptor(schema, ignoreError));
}

export function UseRequestContract(schema: ContractSchema, ignoreError?: boolean) {
  return UseInterceptors(new RequestContractInterceptor(schema, ignoreError));
}

export function UseContracts(requestSchema: { req: ContractSchema; res: ContractSchema }): ContractDecs;
export function UseContracts(requestSchema: ContractSchema, responseSchema: ContractSchema): ContractDecs;
export function UseContracts(
  requestSchema: { req: ContractSchema; res: ContractSchema } | ContractSchema,
  responseSchema?: ContractSchema,
) {
  const multiContractProvided = !(requestSchema instanceof y.Schema);
  const req = multiContractProvided ? requestSchema.req : requestSchema;
  const res = multiContractProvided ? requestSchema.res : responseSchema;
  if (!res) throw Error("@UseContracts requires both a res and req contract!");
  return UseInterceptors(new RequestContractInterceptor(req), new ResponseContractInterceptor(res));
}
