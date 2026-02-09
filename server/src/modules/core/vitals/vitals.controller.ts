import { Controller, Get } from "@nestjs/common";
import { VitalsService } from "./vitals.service";

@Controller("/")
export class VitalsController {
  constructor(private vitalsService: VitalsService) {}

  @Get("/livez")
  alive() {}

  @Get("/healthz")
  async healthy() {
    return this.vitalsService.healthy();
  }

  @Get("/readyz")
  async ready() {}
}
