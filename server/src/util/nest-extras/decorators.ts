import { Request } from "express";
import { createParamDecorator, ExecutionContext, NotFoundException } from "@nestjs/common";
import { ApiPathParams } from "@atlas/enums";

export const SimpleParamDecorator = (param: string) =>
  createParamDecorator((_data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest() as Request;
    const paramData = request.params[param] as string | undefined;
    if (!paramData) throw new NotFoundException(`:${param} not included in path!`);
    if (["null", "undefined"].includes(paramData)) throw new NotFoundException(`:${param} falsey in path!`);
    return paramData;
  });

export const ProjectId = SimpleParamDecorator(ApiPathParams.ProjectId);
