import "dotenv/config";
import v8 from "node:v8";
import { ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import helmet from "helmet";
import { AppModule } from "./app.module";
import CONFIG from "@akc/config";
import { LOG } from "@akc/logging";
import { ApiClientExceptionFilter, HeaderDateVersionStrategy } from "@akc/nest-extras";
import { RedisIoAdapter } from "./util/nest-extras/redis.adapter";
import { ClusterService } from "./util/nest-extras/cluster.service";

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bodyParser: false, logger: ["error", "warn"] });
  app.enableCors();
  app.use(helmet({ contentSecurityPolicy: false })); // Allows client to connect to any server when making api requests
  app.enableShutdownHooks();
  app.useGlobalPipes(new ValidationPipe());
  app.enableVersioning(HeaderDateVersionStrategy.versioning());
  app.useGlobalFilters(new ApiClientExceptionFilter());
  const redisIoAdapter = new RedisIoAdapter(app);
  await redisIoAdapter.connectToRedis();

  app.useWebSocketAdapter(redisIoAdapter);

  /* Add custom Injectors here */

  await app.listen(CONFIG.PORT);
  LOG.verbosityPrint();
  LOG.info(`NodeJS Heap Memory: ${v8.getHeapStatistics().heap_size_limit / (1024 * 1024)} MB`);
  LOG.info(`Server started listening on ${CONFIG.PORT}`);
  // LOG._levelPrint();
}
bootstrap();

// ClusterService.clusterize(bootstrap);
