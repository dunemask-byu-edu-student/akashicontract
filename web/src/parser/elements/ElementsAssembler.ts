import { ACElementKind, ACElementReference, ACRaw, AcElementState, ACElementStateMap } from "./ElementsCommon";

type NestItemCore = {
  isNullable: boolean;
  isArray: boolean;
  kind: ACElementKind;
};
type NestItemRaw = NestItemCore & { kind: "raw"; raw: ACRaw };
type NestItemObject = NestItemCore & {
  kind: "object";
  children: ACElementNest;
  vin: string;
};
type NestItemEnum = NestItemCore & {
  kind: "enum";
  values: string[];
  vin: string;
};

type NestItem = NestItemRaw | NestItemObject | NestItemEnum;
export type ACElementNest = Record<string, NestItem>;

export class ElementsAssembler {
  assembleMap(state: AcElementState): ACElementStateMap {
    const map: ACElementStateMap = {
      objects: new Map(state.objects.map((e) => [e.vin, e])),
      enums: new Map(state.enums.map((e) => [e.vin, e])),
    };
    return map;
  }

  assembleState(stateMap: ACElementStateMap) {
    const state: AcElementState = {
      objects: Array.from(stateMap.objects.values()),
      enums: Array.from(stateMap.enums.values()),
    };
    return state;
  }

  assembleNest(objectVin: string, stateMap: ACElementStateMap): ACElementNest {
    return this.#assembleNest(objectVin, stateMap, 0);
  }

  #assembleNest(objectVin: string, stateMap: ACElementStateMap, depth: number): ACElementNest {
    if (depth > 500) throw new Error("Maximum depth exceeded!");
    const nestRoot = stateMap.objects.get(objectVin);
    if (!nestRoot) throw new Error(`Could not find object '${objectVin}'!`);
    const object: ACElementNest = {};
    for (const child of nestRoot.children) {
      const { isNullable, isArray, kind } = child;
      const nestItemCore: NestItemCore = { isNullable, isArray, kind };
      if (kind === "raw") {
        object[child.property] = {
          ...nestItemCore,
          kind: "raw",
          raw: child.raw,
        } as NestItemRaw;
        continue;
      }
      const acRef = child as ACElementReference;
      const vin = acRef.vin;
      if (kind === "enum") {
        const acEnum = stateMap.enums.get(vin);
        if (!acEnum) throw new Error(`Could not find enum for '${JSON.stringify(child)}'`);
        object[child.property] = {
          vin,
          ...nestItemCore,
          values: acEnum.values,
        } as NestItemEnum;
      } else if (kind === "object") {
        const children = this.#assembleNest(vin, stateMap, depth + 1);
        object[child.property] = {
          vin,
          ...nestItemCore,
          children,
        } as NestItemObject;
      }
    }
    return object;
  }

  // Core Generated with AI,
  assembleDag(stateMap: ACElementStateMap): string[] {
    const graph: Record<string, string[]> = {};

    for (const obj of stateMap.objects.values()) {
      const deps: string[] = [];
      for (const child of obj.children) if (child.kind === "object") deps.push((child as ACElementReference).vin);
      graph[obj.vin] = deps;
    }

    const visited = new Set<string>();
    const stack = new Set<string>();
    const result: string[] = [];

    function dfs(vin: string): void {
      if (stack.has(vin)) throw new Error(`Cycle detected at '${vin}'`);
      if (visited.has(vin)) return;
      stack.add(vin);
      const deps = graph[vin];
      if (deps) for (const dep of deps) dfs(dep);
      stack.delete(vin);
      visited.add(vin);
      result.push(vin);
    }

    for (const vin in graph) dfs(vin);
    return result;
  }
}
