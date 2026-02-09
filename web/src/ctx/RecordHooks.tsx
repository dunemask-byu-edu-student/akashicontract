import { DeltaProcessor } from "@akc/parser/deltas/DeltaProcessor";
import { useCollectionContext } from "./CollectionContext";
import { useDraftContext } from "./DraftContext";
import { ACRecordCollection, ACRecordKind, DecodeLineReturn } from "@akc/parser/collection/CollectionCommon";
import { CollectionParser } from "@akc/parser/collection/CollectionParser";
import { ACRObject } from "@akc/parser/elements/ElementsCommon";
import { useState, useCallback, useEffect } from "react";

function getStrippedCollection<T extends Exclude<ACRecordKind, "L10N">>(collection: ACRecordCollection, kind: T) {
  const stripped = CollectionParser.getEmptyCollection();
  const kindEntries = collection[kind].entries() as MapIterator<[string, DecodeLineReturn<T>]>;
  for (const [t, v] of kindEntries) stripped[kind].set(t, v as any);
  return stripped;
}

export function useEnums() {
  const { deltaMap } = useDraftContext();
  const { collection } = useCollectionContext();
  const reduced = getStrippedCollection(collection, ACRecordKind.ENUM);
  new DeltaProcessor(reduced).resolveDeltas(deltaMap);
  const items = Array.from(reduced[ACRecordKind.ENUM].values());
  const draftedVins = new Set(
    Array.from(deltaMap.values())
      .filter((d) => d.kind === ACRecordKind.ENUM)
      .map((d) => d.target),
  );
  return { items, draftedVins };
}

export function useObjects() {
  const { deltaMap } = useDraftContext();
  const { collection } = useCollectionContext();
  const reduced = getStrippedCollection(collection, ACRecordKind.OBJ);
  new DeltaProcessor(reduced).resolveDeltas(deltaMap);
  const items = Array.from(reduced[ACRecordKind.OBJ].values());
  const draftedVins = new Set(
    Array.from(deltaMap.values())
      .filter((d) => d.kind === ACRecordKind.OBJ)
      .map((d) => d.target),
  );
  return { items, draftedVins };
}

export function useErrors() {
  const { deltaMap } = useDraftContext();
  const { collection } = useCollectionContext();
  const reduced = getStrippedCollection(collection, ACRecordKind.ERR);
  new DeltaProcessor(reduced).resolveDeltas(deltaMap);
  const items = Array.from(reduced[ACRecordKind.ERR].values());
  const draftedVins = new Set(
    Array.from(deltaMap.values())
      .filter((d) => d.kind === ACRecordKind.ERR)
      .map((d) => d.target),
  );
  return { items, draftedVins };
}

interface SearchResponse {
  items: ACRObject[];
  next: string | null;
  prev: string | null;
  more: boolean;
}

interface UseVinSearchResult {
  cursor: string | null;
  items: ACRObject[];
  total: number;
  more: boolean;
  next: () => Promise<void>;
  prev: () => Promise<void>;
}

/**
 * Cursor-based VIN search hook.
 * Currently local (filters and chunks data in-memory),
 * but async-ready for real API calls.
 */
export function useVinSearch(key: string): UseVinSearchResult {
  const { items: allItems } = useObjects();

  const [cursor, setCursor] = useState<string | null>(null);
  const [data, setData] = useState<SearchResponse>({
    items: [],
    next: null,
    prev: null,
    more: false,
  });

  const [total, setTotal] = useState(0);

  // 🧠 Mock async fetcher — replace this with a real API call later
  const fetchVinResults = useCallback(
    async (cursorValue: string | null): Promise<SearchResponse> => {
      // Simulate filtering and "cursor-based" chunking
      const filtered = allItems.filter((e) => e.vin.toLowerCase().includes(key.toLowerCase()));

      const chunkSize = 100;
      const startIndex = cursorValue ? parseInt(cursorValue, 10) : 0;
      const endIndex = startIndex + chunkSize;
      const nextCursor = endIndex < filtered.length ? String(endIndex) : null;
      const prevCursor = startIndex > 0 ? String(Math.max(0, startIndex - chunkSize)) : null;

      const chunk = filtered.slice(startIndex, endIndex);
      const more = Boolean(nextCursor);

      return {
        items: chunk,
        next: nextCursor,
        prev: prevCursor,
        more,
      };
    },
    [allItems, key],
  );

  // 🚀 Initial load or when key changes
  useEffect(() => {
    (async () => {
      const result = await fetchVinResults(null);
      setData(result);
      setCursor(null);
      setTotal(allItems.filter((e) => e.vin.toLowerCase().includes(key.toLowerCase())).length);
    })();
  }, [key, allItems, fetchVinResults]);

  // ⏭️ Next page
  const next = useCallback(async () => {
    if (!data.next) return;
    const result = await fetchVinResults(data.next);
    setData(result);
    setCursor(data.next);
  }, [data.next, fetchVinResults]);

  // ⏮️ Previous page
  const prev = useCallback(async () => {
    if (!data.prev) return;
    const result = await fetchVinResults(data.prev);
    setData(result);
    setCursor(data.prev);
  }, [data.prev, fetchVinResults]);

  return {
    cursor,
    items: data.items,
    total,
    more: data.more,
    next,
    prev,
  };
}
