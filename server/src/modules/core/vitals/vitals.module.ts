import { Module } from "@nestjs/common";
import { VitalsService } from "./vitals.service";
import { VitalsController } from "./vitals.controller";
import { DiscoveryModule } from "@nestjs/core";

@Module({
  imports: [DiscoveryModule],
  providers: [VitalsService],
  controllers: [VitalsController],
})
export class VitalsModule {}
