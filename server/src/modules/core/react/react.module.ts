import { Module } from "@nestjs/common";
import { ServeStaticModule } from "@nestjs/serve-static";
import path from "node:path";
import { ReactRedirectController } from "./react-redirect.controller";
const staticFolderPath = path.resolve(__dirname, "../../../static");

@Module({
  imports: [ServeStaticModule.forRoot({ rootPath: staticFolderPath, serveRoot: "/akashicontract" })],
  controllers: [ReactRedirectController],
})
export class ReactModule {}
