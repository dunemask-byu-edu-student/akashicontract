import { ClientConfigKeywords } from "@atlas/enums";
import CONFIG from "@config";
export function handleConfigErrors() {
  const isDraft = CONFIG.SYNCING.AKC_RECORD_REF.startsWith(ClientConfigKeywords.DRAFT_PREFIX);
  if (CONFIG.SYNCING.PERFORM_WATCH && !CONFIG.SYNCING.PERFORM_SYNC)
    throw new Error(`The watch command must be used with the pull command!`);
  if (CONFIG.SYNCING.PERFORM_WATCH && !isDraft)
    throw new Error(`The watch command must be used with a draft reference`);
  if (CONFIG.BUILDER.PRODUCTION_MODE && isDraft) throw new Error(`Draft references are not allowed in production!`);
}
