import { ACRecordCollection, ACRecordKind } from "@akc/parser/collection/CollectionCommon";
import { CollectionParser } from "@akc/parser/collection/CollectionParser";
import { ACRefVinPrefix } from "@akc/parser/elements/ElementsCommon";
import { CObjectDefinition } from "@atlas/contracts";
import { createContext, ReactNode, useContext, useState, useEffect } from "react";

type ObjectDef = CObjectDefinition["ObjectDefinition"];

interface CollectionContextProps {
  collectionRef: string;
  collection: ACRecordCollection;
  ready: boolean;
  contracts: ObjectDef[];
  changeCollection: (r: string) => Promise<void>;
  refresh: () => Promise<void>;
}

const defaultCollectionContextValues: CollectionContextProps = {
  collectionRef: "main",
  collection: CollectionParser.getEmptyCollection(),
  ready: false,
  contracts: [],
  changeCollection: async () => void 0,
  refresh: async () => void 0,
};

const CollectionContext = createContext<CollectionContextProps>(defaultCollectionContextValues);

export const CollectionProvider = ({ children }: { children: ReactNode }) => {
  const [ref, setRef] = useState(defaultCollectionContextValues.collectionRef);
  const [collection, setCollection] = useState<ACRecordCollection>(defaultCollectionContextValues.collection);
  const [ready, setReady] = useState(defaultCollectionContextValues.ready);
  const [contracts, setContracts] = useState<ObjectDef[]>([]);

  async function loadCollection(collectionRef: string) {
    setReady(false);
    setCollection(CollectionParser.getEmptyCollection());
    setContracts([]);
    try {
      const res = await fetch("/api/contracts/objects?pageSize=100");
      if (!res.ok) throw new Error(`Failed to fetch contracts: ${res.status}`);
      const data: ObjectDef[] = await res.json();
      setContracts(data);
      const newCollection = CollectionParser.getEmptyCollection();
      for (const contract of data) {
        const vin = `${ACRefVinPrefix.enum}${contract.name}`;
        newCollection[ACRecordKind.ENUM].set(vin, { vin, values: Object.keys(contract.attributes) });
      }
      setCollection(newCollection);
    } catch (e) {
      console.error("Failed to load collection:", e);
    } finally {
      setReady(true);
    }
  }

  useEffect(() => {
    loadCollection("main");
  }, []);

  async function changeCollection(newRef: string) {
    await loadCollection(newRef);
    setRef(newRef);
  }

  async function refresh() {
    await loadCollection(ref);
  }

  const ctxValue: CollectionContextProps = {
    collectionRef: ref,
    collection,
    ready,
    contracts,
    changeCollection,
    refresh,
  };

  return <CollectionContext.Provider value={ctxValue}>{children}</CollectionContext.Provider>;
};

export const useCollectionContext = () => useContext(CollectionContext);
