import { AtlasPolicyMap, Resource } from "@atlas/enums";
import { ResourcePolicyGuard } from "./resource-policy.guard";
import { UseGuards } from "@nestjs/common";

export { UseGuards } from "@nestjs/common/decorators";

export class ContentGuard {
  static IsRoot = ResourcePolicyGuard([AtlasPolicyMap.IAM_Root.ROOT.SELF]);
}

export const UseContentGuard = (g: ReturnType<typeof ResourcePolicyGuard>) => UseGuards(g);
