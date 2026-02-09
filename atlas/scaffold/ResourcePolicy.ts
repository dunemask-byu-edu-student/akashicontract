export enum ResourcePolicyAuthorizedCondition {
  ANY = "any",
  ALL = "all",
}

export enum Policy {
  ROOT = "root",
  CREATE = "create",
  READ = "read",
  WRITE = "write",
  DELETE = "delete",
  ANY = "*",
}

export enum PolicyTarget {
  SELF = "self",
  OTHERS = "others",
  ALL = "all",
}

export declare type ResourcePolicyString<Resource extends string> = `${Resource}.${Policy}.${PolicyTarget}`;
export declare type ResourcePolicyType<Resource extends string> =
  | ResourcePolicy<Resource>
  | ResourcePolicyString<Resource>;
export declare type ResourcePolicyComputeType<Resource extends string> =
  | Array<ResourcePolicyType<Resource>>
  | ResourcePolicyType<Resource>;

/**
 * @param resource a `Record<string, string>` of resources to map to policies
 * @returns a map of Resource Policy strings mapped to the pattern `PolicyMap.MyResource.WRITE.SELF` (which would result in `"my-resource.write.self"`)
 */
export const resourcePolicyLiterals = <T extends Record<string, string>>(resource: T) =>
  Object.fromEntries(
    Object.entries(resource).map(([rsName, rsType]) => [
      rsName,
      Object.fromEntries(
        Object.entries(Policy).map(([polName, polVal]) => [
          polName,
          Object.fromEntries(
            Object.entries(PolicyTarget).map(([polTargetName, polTargetVal]) => [
              polTargetName,
              `${rsType}.${polVal}.${polTargetVal}`,
            ]),
          ),
        ]),
      ),
    ]),
  ) as {
    [RS in keyof T]: {
      [K in keyof typeof Policy]: {
        [J in keyof typeof PolicyTarget]: `${T[RS]}.${(typeof Policy)[K]}.${(typeof PolicyTarget)[J]}`;
      };
    };
  };

/**
 * @param resource a `Record<string, string>` of resources to map to policies
 * @returns a map of Resource Policy instances mapped to the pattern `PolicyMap.MyResource.READ.OTHERS`
 */
export const resourcePolicyMap = <T extends Record<string, string>>(resource: T) =>
  Object.fromEntries(
    Object.entries(resource).map(([rsName, rsType]) => [
      rsName,
      Object.fromEntries(
        Object.entries(Policy).map(([polName, polVal]) => [
          polName,
          Object.fromEntries(
            Object.entries(PolicyTarget).map(([polTargetName, polTargetVal]) => [
              polTargetName,
              new ResourcePolicy(`${rsType}.${polVal}.${polTargetVal}`),
            ]),
          ),
        ]),
      ),
    ]),
  ) as { [RS in keyof T]: { [K in keyof typeof Policy]: { [J in keyof typeof PolicyTarget]: ResourcePolicy<T[RS]> } } };

/**
 * @param resource a `Record<string, string>` of resources to map to policiy strings
 * @returns a map of Resource Policy instances mapped to an array of `"my-resource.create"`
 */
export const resourcePolicyList = <T extends Record<string, string>>(resource: T) =>
  Object.values(resource).flatMap((r) =>
    Object.values(Policy).flatMap((p) => Object.values(PolicyTarget).map((t) => `${r}.${p}.${t}`)),
  ) as Array<`${T[keyof T]}.${Policy}.${PolicyTarget}`>;

const InvalidPolicy = Error(`Invalid policy! Valid options are ${Object.values(Policy).join(", ")}`);
const InvalidPolicyTarget = Error(`Invalid policyTarget! Valid options are ${Object.values(PolicyTarget).join(", ")}`);

export class ResourcePolicy<Resource extends string> {
  declare resource: Resource;
  declare policy: Policy;
  declare target: PolicyTarget;

  static parsePolicy<Resource extends string>(policy: string): [Resource, Policy, PolicyTarget] {
    const parts = policy.split(".");
    if (parts.length !== 3) throw Error("Invalid resource policy!");
    if (!Object.values(Policy).includes(parts[1] as Policy)) throw InvalidPolicy;
    if (!Object.values(PolicyTarget).includes(parts[2] as PolicyTarget)) throw InvalidPolicyTarget;
    return [parts[0] as Resource, parts[1] as Policy, parts[2] as PolicyTarget];
  }

  static parseResourcePolicies<Resource extends string>(resources: ResourcePolicyComputeType<Resource>) {
    const resourceArr = Array.isArray(resources) ? resources : [resources];
    return resourceArr.map(function convertToPolicy(r: ResourcePolicyType<Resource>) {
      if (r instanceof ResourcePolicy) return r;
      return new ResourcePolicy<Resource>(r);
    });
  }

  static multiAuthorizedTo<Resource extends string>(
    policies: ResourcePolicyComputeType<Resource>,
    required: ResourcePolicyComputeType<Resource>,
    filter = ResourcePolicyAuthorizedCondition.ANY,
  ) {
    const existingPolicies = ResourcePolicy.parseResourcePolicies(policies);
    const requiredPolicies = ResourcePolicy.parseResourcePolicies(required);
    const isAllFilter = filter === ResourcePolicyAuthorizedCondition.ALL;
    const isAnyFilter = filter === ResourcePolicyAuthorizedCondition.ANY;
    if (requiredPolicies.length === 0) return true;
    for (const e of existingPolicies) {
      for (const r of requiredPolicies) {
        const isAuthorized = e.authorizedTo(r);
        if (!isAuthorized && isAllFilter) return false;
        else if (isAuthorized && isAnyFilter) return true;
      }
    }
    return isAllFilter;
  }

  static canDo = this.multiAuthorizedTo;

  static canDoAny<Resource extends string>(
    policies: ResourcePolicyComputeType<Resource>,
    required: ResourcePolicyComputeType<Resource>,
  ) {
    return ResourcePolicy.canDo(policies, required, ResourcePolicyAuthorizedCondition.ANY);
  }

  static canDoAll<Resource extends string>(
    policies: ResourcePolicyComputeType<Resource>,
    required: ResourcePolicyComputeType<Resource>,
  ) {
    return ResourcePolicy.canDo(policies, required, ResourcePolicyAuthorizedCondition.ALL);
  }

  constructor(resource: ResourcePolicyString<Resource>);
  constructor(resource: Resource | ResourcePolicyString<Resource>, policy?: Policy, target?: PolicyTarget) {
    [this.resource, this.policy, this.target] =
      !!policy && !!target
        ? [resource as Resource, policy, target]
        : ResourcePolicy.parsePolicy(resource as ResourcePolicyString<Resource>);
  }

  toString(): ResourcePolicyString<Resource> {
    return `${this.resource}.${this.policy}.${this.target}`;
  }

  private policyAuthorizedTo(policy: ResourcePolicy<Resource>): boolean {
    if (this.resource !== policy.resource) return false; // Resource doesn't match, no authority
    if (this.policy === Policy.ROOT) return true; // User has root policy of this resource
    if (policy.policy === Policy.ANY) return true; // Resource has any policy
    if (this.policy === policy.policy) return true; // Policy Identically matches
    // Match additional "sub policies" (If a user can create, they can also do _____)
    if (this.policy === Policy.WRITE && policy.policy === Policy.READ) return true;
    if (this.policy === Policy.CREATE) return [Policy.WRITE, Policy.READ].includes(policy.policy);
    if (this.policy === Policy.DELETE) return [Policy.WRITE, Policy.READ].includes(policy.policy);
    return false;
  }

  private policyTargetAuthorizedTo(policyTarget: ResourcePolicy<Resource>): boolean {
    if (this.target === PolicyTarget.ALL) return true;
    if (this.target === policyTarget.target) return true;
    return false;
  }

  private authorizedTo(policy: ResourcePolicy<Resource>): boolean {
    if (!this.policyAuthorizedTo(policy)) return false;
    return this.policyTargetAuthorizedTo(policy);
  }

  static asStrings<Resource extends string>(resourcePolicies: ResourcePolicy<Resource>[]) {
    return resourcePolicies.map((rp) => rp.toString()) as ResourcePolicyString<Resource>[];
  }

  static multiple<Resource extends string>(...resourcePolicies: ResourcePolicyString<Resource>[]) {
    return ResourcePolicy.parseResourcePolicies<Resource>(resourcePolicies);
  }
}
