// Please use the format "subject.kind.verb.optional-specifier"
export const EventQueues = [
  `distribution.release.job.v1.logs.store`,
  `distribution.release.job.v1.complete`,
  `distribution.release.job.v1.requeue`,
  `distribution.release.job.v1.worker.request`,
] as const;

export type EventQueue = (typeof EventQueues)[number];

type SplitAndNest<Path extends string, Value extends string> = Path extends `${infer Head}.${infer Tail}`
  ? { [K in Head]: SplitAndNest<Tail, Value> }
  : { [K in Path]: Value };

type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends (k: infer I) => void ? I : never;

type BuildEventTree<T extends readonly string[]> = UnionToIntersection<
  T[number] extends infer Path extends string ? SplitAndNest<Path, Path> : never
>;

// Fancy function written by AI that takes the array of strings and constructs a usable object instead
// If you need to fix this, giving AI the full context should be totally fine
function buildEventTree<T extends readonly string[]>(events: T): BuildEventTree<T> {
  return events.reduce(
    (t, e) => (
      e
        .split(".")
        .reduce(
          (c, p, i, a) => (c[p] ??= i === a.length - 1 ? e : {}) as Record<string, unknown>,
          t as Record<string, unknown>,
        ),
      t
    ),
    {} as BuildEventTree<T>,
  );
}

export const EventQueueTree = buildEventTree(EventQueues);
export const ScheduledTaskQueueName = "scheduled-events" as const;
