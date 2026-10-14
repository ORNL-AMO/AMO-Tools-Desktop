/** Array order is the banner chevron order. Kept apart from fsat.routing.ts, whose component imports would make FsatService import circular. */
export const FSAT_MAIN_VIEWS: Array<string> = ['baseline', 'assessment', 'diagram', 'report', 'sankey', 'calculators'];

/** Tabs the banner gates behind setupDone. */
export const FSAT_SETUP_GATED_VIEWS: Array<string> = ['assessment', 'diagram', 'report', 'sankey'];
