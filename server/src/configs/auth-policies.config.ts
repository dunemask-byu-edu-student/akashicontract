import { AtlasPolicy, AtlasPolicyMap, AtlasPolicyString, Resource } from "@atlas/enums";

const DEFAULT_POLICY_ID_MAP = {
  ROOT: "policy_019311a6462077238fa92bdf76109133",
  ORG_ADMIN: "policy_019311a7d6a371009d48225a1b5b3ce8",
  TEAM_ADMIN: "policy_019311a7d6a476c1b1f566f5837502c0",
};

const POLICY_MAP: Record<keyof typeof DEFAULT_POLICY_ID_MAP, AtlasPolicy[]> = {
  ROOT: $unsafeGetRootPolicy(),
  ORG_ADMIN: [
    AtlasPolicyMap.IAM_OrgAdmin.ROOT.SELF,
    AtlasPolicyMap.OrgSettings.ROOT.SELF,
    AtlasPolicyMap.OrgVerification.READ.SELF,
  ],
  TEAM_ADMIN: [AtlasPolicyMap.IAM_TeamAdmin.ROOT.SELF],
};

function $unsafeGetRootPolicy(): AtlasPolicy[] {
  const policies: AtlasPolicyString[] = [];
  for (const resource of Object.values(Resource)) policies.push(`${resource}.root.all`);
  return AtlasPolicy.multiple<Resource>(...policies) as AtlasPolicy[];
}

export const DEFAULT_POLICY_MAP = Object.fromEntries(
  Object.keys(DEFAULT_POLICY_ID_MAP).map((pt) => [
    pt as keyof typeof DEFAULT_POLICY_ID_MAP,
    {
      id: DEFAULT_POLICY_ID_MAP[pt as keyof typeof DEFAULT_POLICY_ID_MAP],
      policies: POLICY_MAP[pt as keyof typeof DEFAULT_POLICY_ID_MAP],
    },
  ]),
) as Record<keyof typeof DEFAULT_POLICY_ID_MAP, { id: string; policies: AtlasPolicy[] }>;
