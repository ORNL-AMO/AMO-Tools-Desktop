/** Array order is the banner chevron order. Kept apart from fsat.routing.ts, whose component imports would make FsatService import circular. */
export const FSAT_MAIN_VIEWS = ['baseline', 'assessment', 'diagram', 'report', 'sankey', 'calculators'] as const;
export type FsatMainView = typeof FSAT_MAIN_VIEWS[number];

/** Tabs the banner gates behind setupDone. */
export const FSAT_SETUP_GATED_VIEWS: ReadonlyArray<FsatMainView> = ['assessment', 'diagram', 'report', 'sankey'];
