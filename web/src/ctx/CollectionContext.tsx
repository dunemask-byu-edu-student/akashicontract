import { ACRecordCollection } from "@akc/parser/collection/CollectionCommon";
import { CollectionParser } from "@akc/parser/collection/CollectionParser";
import { ACDelta, ACDeltaMap } from "@akc/parser/deltas/DeltaCommon";
import { createContext, ReactNode, useContext, useState } from "react";

interface CollectionContextProps {
  collectionRef: string;
  collection: ACRecordCollection;
  ready: boolean;
  changeCollection: (r: string) => Promise<void>;
}

const defaultCollectionContextValues: CollectionContextProps = {
  collectionRef: "main",
  collection: CollectionParser.getEmptyCollection(),
  ready: false,
  changeCollection: async () => void 0,
};

const CollectionContext = createContext<CollectionContextProps>(defaultCollectionContextValues);

export const CollectionProvider = ({ children }: { children: ReactNode }) => {
  const [ref, setRef] = useState(defaultCollectionContextValues.collectionRef);
  const [collection, setCollection] = useState<ACRecordCollection>(defaultCollectionContextValues.collection);
  const [ready, setReady] = useState(defaultCollectionContextValues.ready);

  async function loadCollection(ref: string) {
    setCollection(defaultCollectionContextValues.collection);
  }

  async function changeCollection(ref: string) {
    await loadCollection(ref);
    setRef(ref);
  }

  const ctxValue: CollectionContextProps = {
    collectionRef: ref,
    collection,
    ready,
    changeCollection,
  };

  return <CollectionContext.Provider value={ctxValue}>{children}</CollectionContext.Provider>;
};

export const useCollectionContext = () => useContext(CollectionContext);
