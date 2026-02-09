import { ACDelta, ACDeltaMap } from "@akc/parser/deltas/DeltaCommon";
import { createContext, ReactNode, useContext, useState } from "react";

interface DraftContextProps {
  drafting: boolean;
  notes: string;
  deltaMap: ACDeltaMap;
  upsertDelta: (d: ACDelta) => Promise<void>;
  deleteDelta: (t: string) => Promise<void>;
  selectBase: (b: string) => void;
}

const defaultDraftContextValues: DraftContextProps = {
  drafting: false,
  deltaMap: new Map(),
  notes: "",
  upsertDelta: async () => void 0,
  deleteDelta: async () => void 0,
  selectBase: () => void 0,
};

const DraftContext = createContext<DraftContextProps>(defaultDraftContextValues);

export const DraftProvider = ({ children }: { children: ReactNode }) => {
  const [baseVersionId, setBaseVersionId] = useState<string | undefined>(undefined);
  const [drafting, setDrafting] = useState<boolean>(defaultDraftContextValues.drafting);
  const [deltaMap, setDeltaMap] = useState<ACDeltaMap>(defaultDraftContextValues.deltaMap);
  const [notes, setNotes] = useState<string>(defaultDraftContextValues.notes);

  function selectBase(b: string) {
    if (drafting) throw new Error(`Cannot change bases mid draft!`);
    setBaseVersionId(b);
  }

  async function autodraft() {
    setDrafting(true);
  }

  async function deleteDelta(target: string) {
    const newDeltaMap = new Map(deltaMap.entries());
    newDeltaMap.delete(target);
    setDeltaMap(newDeltaMap);
  }

  async function upsertDelta(e: ACDelta) {
    const newDeltaMap = new Map(deltaMap.entries());
    newDeltaMap.set(e.target, e);
    setDeltaMap(newDeltaMap);
    autodraft();
  }

  const ctxValue: DraftContextProps = {
    notes,
    deltaMap,
    drafting,
    upsertDelta,
    deleteDelta,
    selectBase,
  };

  return <DraftContext.Provider value={ctxValue}>{children}</DraftContext.Provider>;
};

export const useDraftContext = () => useContext(DraftContext);
