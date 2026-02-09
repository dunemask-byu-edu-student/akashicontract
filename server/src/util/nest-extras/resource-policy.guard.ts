import { CanActivate, ExecutionContext, Type, mixin, Inject } from "@nestjs/common";
import { ResourcePolicyAuthorizedCondition as GuardCondition } from "@atlas/scaffold/ResourcePolicy";
import { AtlasPolicy, AtlasPolicyList, AtlasPolicyComputeType as GuardPolicies } from "@atlas/enums";
import { PostgresService } from "@akc/postgres";
import CONFIG from "@akc/config";
import { verifyJwt } from "../crypto.util";
import { ApiClientError } from "@atlas/scaffold/ApiClient";

const anyGuard = GuardCondition.ANY;
declare type ResourceGuard = Type<CanActivate>;

export function ResourcePolicyGuard(required: GuardPolicies, condition: GuardCondition = anyGuard): ResourceGuard {
  class ResourcePolicyGuardMixin implements CanActivate {
    constructor(@Inject(PostgresService) private readonly _pgService: PostgresService) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
      return true;
      // const request = context.switchToHttp().getRequest();
      // const token = request.headers["authorization"];
      // if (!token || typeof token !== "string")
      //   throw new ApiClientError("GUARD.NO_AUTH_HEADER", 401, "Authorization header required!");
      // const userToken = token.replace("Bearer ", "");
      // const tokenData = (await verifyJwt(userToken, CONFIG.CRYPTO.JWT_ACCESS_TOKEN_PUB_KEY)) as any | undefined;
      // if (typeof tokenData !== "object" || !tokenData.authnId)
      //   throw new ApiClientError("GUARD.NO_TOKEN_AUTHN", 401, "Token missing authnId!");
      // if (!!tokenData) return this.useAuthnToken(tokenData.authnId, request);
      // throw new ApiClientError("GUARD.BAD_TOKEN", 401, `Token invalid, expired, or revoked!`);
    }

    async useAuthnToken(authnId: string | undefined, request: any) {
      return true;
      // const authnFindData = { where: { id: authnId }, include: { authPolicy: true } };
      // const authn = await this._pgService.authn.findUnique(authnFindData);
      // if (!authn) throw new ApiClientError("GUARD.NO_AUTHN", 401, `Authn not found with id '${authnId}'`);
      // const policies = AtlasPolicy.parseResourcePolicies(authn.authPolicy.policies as typeof AtlasPolicyList);
      // const authorized = AtlasPolicy.multiAuthorizedTo(policies, required, condition);
      // if (!authorized) throw new ApiClientError("GUARD.INSUFFICIENT_PERMISSIONS", 403, `Insufficient Permissions!`);
      // request.authPolicies = policies;
      // request.authn = authn;
      // delete request.authn.hash;
      // delete request.authn.authPolicy;
      // return true;
    }
  }

  return mixin(ResourcePolicyGuardMixin);
}
