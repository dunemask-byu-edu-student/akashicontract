import { Controller, Get, Next, Req, Res } from "@nestjs/common";
import { NextFunction, Request, Response } from "express";

export const serveRoot = "/akashicontract" as const;
const passthrough = [
  serveRoot, // Used to passthrough the static files
  "/api", // Used to passthrough api routes
];

@Controller("/")
export class ReactRedirectController {
  constructor() {}

  @Get("*")
  alive(@Req() req: Request, @Res() res: Response, @Next() next: NextFunction) {
    const passthroughMatch = passthrough.findIndex((prefix) => req.path.startsWith(prefix)) != -1;
    if (passthroughMatch) return next();
    res.redirect("/akashicontract");
  }
}
