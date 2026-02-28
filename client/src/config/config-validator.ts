// config-validator.ts

import { ClientConfigKeywords } from "@atlas/enums";
import type { RuntimeConfigShape } from "./config";

export function validateRuntimeConfig(state: RuntimeConfigShape) {
  validateClientRules(state);
  validateSyncRules(state);
  validateProductionRules(state);
}

/**
 * Validate rules related to client config shape
 */
function validateClientRules(state: RuntimeConfigShape) {
  if (!state.client?.recordInstance) throw new Error("recordInstance is required.");

  if (!state.client?.recordRef) throw new Error("recordRef is required.");
}

/**
 * Validate syncing related constraints
 */
function validateSyncRules(state: RuntimeConfigShape) {
  if (state.watch && !state.pull) throw new Error("The watch command must be used together with the pull command.");

  const isDraft = state.client!.recordRef.startsWith(ClientConfigKeywords.DRAFT_PREFIX);
  if (state.watch && !isDraft) throw new Error("The watch command must be used with a draft reference.");
}

/**
 * Validate production constraints
 */
function validateProductionRules(state: RuntimeConfigShape) {
  const isDraft = state.client!.recordRef.startsWith(ClientConfigKeywords.DRAFT_PREFIX);
  if (state.production && isDraft) throw new Error("Draft references are not allowed in production mode.");
}
