/**
 * Shared Plotly text styling for charts.
 */

/** "Chrome" tier: axis titles, legends, pie-group titles, and any chart-wide `layout.font` fallback. */
export const CHART_TITLE_FONT_SIZE = 20;

/** "Data" tier: in-chart data labels — pie slice text, sankey node/hover text, annotation callouts. */
export const CHART_LABEL_FONT_SIZE = 14;

/** Font family used on axis titles that specify one explicitly (e.g. PSAT/FSAT power-comparison charts). */
export const CHART_TITLE_FONT_FAMILY = 'Roboto';

/** Layout margin for a chart made up of side-by-side pies with no axes (PSAT/FSAT energy distribution). */
export const SIDE_BY_SIDE_PIE_MARGIN = { t: 40, b: 10, l: 10, r: 10 };

/** Horizontal gap between two side-by-side pies, as a fraction of total chart width. */
const SIDE_BY_SIDE_PIE_GAP = 0.02;

/** Domain for the `index`-th (0 or 1) pie in a two-pie side-by-side layout, using SIDE_BY_SIDE_PIE_GAP. */
export function getSideBySidePieDomain(index: number): { x: [number, number]; y: [number, number] } {
  const half = (1 - SIDE_BY_SIDE_PIE_GAP) / 2;
  return {
    x: index === 0 ? [0, half] : [half + SIDE_BY_SIDE_PIE_GAP, 1],
    y: [0, 1],
  };
}
