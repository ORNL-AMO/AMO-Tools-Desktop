import { PlotlyService } from 'angular-plotly.js';
import { ReportColumnCell } from '../models/report-ui-models';
import { PairedKeyValueSection } from '../models/report-section.model';
import { FacilityInfo } from '../../models/settings';
import { ReportChartRenderService } from '../services/report-chart-render.service';

/** Appends decoded units to the label when present. Both sides are decoded. */
export function labelWithUnits(label: string, units: string | undefined): string {
  const decoded = decodeHtmlEntities(label);
  if (!units) return decoded;
  return `${decoded} ${decodeHtmlEntities(units)}`;
}

/** Formats a number with configurable decimal places using the en-US locale. */
export function formatNumber(value: number, maxDec = 0, minDec = 0): string {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: minDec,
    maximumFractionDigits: maxDec,
  }).format(value);
}

/** Parses an Angular DecimalPipe format string like '1.0-2' → [minDec, maxDec]. */
export function parseDigitsInfo(digitsInfo: string | undefined): [number, number] {
  if (!digitsInfo) return [0, 0];
  const match = digitsInfo.match(/\d+\.(\d+)-(\d+)/);
  if (!match) return [0, 0];
  return [parseInt(match[1], 10), parseInt(match[2], 10)];
}

/** Decodes numeric HTML entities (e.g. &#8457; → ℉) and strips HTML tags. */
export function decodeHtmlEntities(str: string): string {
  if (!str) return str;
  return str
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(parseInt(code, 10)))
    .replace(/&#x([0-9a-fA-F]+);/g, (_, code) => String.fromCharCode(parseInt(code, 16)))
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/<[^>]+>/g, '');
}

/**
 * Formats a ReportColumnCell value to a display string.
 * Applies currency or decimal pipe formatting when present; falls back to locale number or '—'.
 */
export function formatCell(cell: ReportColumnCell): string {
  if (cell?.value == null) return '—';
  const num = Number(cell.value);
  if (isNaN(num)) return String(cell.value);

  if (cell.currencyPipe) {
    const [minDec, maxDec] = parseDigitsInfo(cell.currencyPipe.digitsInfo);
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: cell.currencyPipe.code,
      minimumFractionDigits: minDec,
      maximumFractionDigits: maxDec,
    }).format(num);
  }

  if (cell.decimalPipe) {
    const [minDec, maxDec] = parseDigitsInfo(cell.decimalPipe);
    return formatNumber(num, maxDec, minDec);
  }

  return num.toLocaleString('en-US');
}

/**
 * Rasterizes a serialized SVG string to a JPEG data URL via an offscreen canvas. Shared by every
 * module's sankey rendering (PSAT, FSAT, compressed-air, ...) — sankeys are the one chart type that
 * needs custom SVG DOM patching (gradients, arrow overlays) after Plotly renders, so `Plotly.toImage`
 * can't be used directly; this is the common last step once the patched SVG has been serialized.
 */
export function svgToJpeg(svgString: string, width: number, height: number): Promise<string> {
  return new Promise((resolve, reject) => {
    const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) { reject(new Error('Canvas 2D context unavailable')); return; }
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, width, height);
      ctx.drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL('image/jpeg', 0.92));
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load serialized SVG as image'));
    };
    img.src = url;
  });
}

/**
 * Builds the standard "Facility Info" paired-key-value sections (General/Location,
 * Facility Contact/Assessment Contact) shared across every module's report adapter.
 */
export function buildFacilityInfoSections(facilityInfo: FacilityInfo | undefined, groupKey: string): PairedKeyValueSection[] {
  if (!facilityInfo) return [];

  const generalAndLocation: PairedKeyValueSection = {
    type: 'paired-key-value',
    title: 'Facility Info',
    group: groupKey,
    left: {
      headerLabel: 'General',
      rows: [
        { label: 'Company Name', value: facilityInfo.companyName ?? '' },
        { label: 'Facility Name', value: facilityInfo.facilityName ?? '' },
        { label: 'Assessment Date', value: facilityInfo.date ?? '' },
      ],
    },
    right: {
      headerLabel: 'Location',
      rows: [
        { label: 'Street', value: facilityInfo.address?.street ?? '' },
        { label: 'City', value: facilityInfo.address?.city ?? '' },
        { label: 'State', value: facilityInfo.address?.state ?? '' },
        { label: 'Zip', value: facilityInfo.address?.zip ?? '' },
        { label: 'Country', value: facilityInfo.address?.country ?? '' },
      ],
    },
  };

  const contacts: PairedKeyValueSection = {
    type: 'paired-key-value',
    group: groupKey,
    left: {
      headerLabel: 'Facility Contact',
      rows: [
        { label: 'Name', value: facilityInfo.facilityContact?.contactName ?? '' },
        { label: 'Phone', value: String(facilityInfo.facilityContact?.phoneNumber ?? '') },
        { label: 'Email', value: facilityInfo.facilityContact?.email ?? '' },
      ],
    },
    right: {
      headerLabel: 'Assessment Contact',
      rows: [
        { label: 'Name', value: facilityInfo.assessmentContact?.contactName ?? '' },
        { label: 'Phone', value: String(facilityInfo.assessmentContact?.phoneNumber ?? '') },
        { label: 'Email', value: facilityInfo.assessmentContact?.email ?? '' },
      ],
    },
  };

  return [generalAndLocation, contacts];
}

/**
 * Builds one row of a baseline-vs-modifications summary table: given a label, baseline value, and a
 * per-modification accessor, produces `[label, baseline, ...modifications]`. Values are stringified
 * with `fmt` (default: `String(v)` or '—' when null/undefined).
 */
export function buildSummaryRow<M, T extends string | number | boolean | null | undefined>(
  mods: M[],
  label: string,
  baseVal: T,
  modFn: (mod: M) => T,
  fmt?: (v: T) => string
): string[] {
  const f = fmt ?? ((v: T) => v != null ? String(v) : '—');
  return [label, f(baseVal), ...mods.map(m => f(modFn(m)))];
}

/**
 * Appends a labeled sub-group header row (spanning all columns) followed by its data rows,
 * and records the header's index in `subGroupHeaderIndices` for bold/accent rendering in the PDF.
 */
export function appendSubGroup(
  rows: string[][],
  subGroupHeaderIndices: number[],
  columnCount: number,
  label: string,
  groupRows: string[][]
): void {
  subGroupHeaderIndices.push(rows.length);
  rows.push([label, ...Array(columnCount - 1).fill('')]);
  rows.push(...groupRows);
}

/**
 * Renders a module chart config ({traces, layout}) to a PNG/JPEG data URL via the shared
 * ReportChartRenderService. Every module's report adapter had its own identical private
 * `renderPlotlyChart` wrapper around this single call — centralized here instead.
 */
export function renderPlotlyChart(chartRenderService: ReportChartRenderService, chart: { traces: unknown[]; layout: object }): Promise<string> {
  return chartRenderService.renderChartToImage(chart.traces as never, chart.layout);
}

/**
 * Finds the row indices (in a built summary-table `rows` array) matching the given labels, for use
 * as `emphasisRowsIndices`. Skips labels that aren't found rather than throwing.
 */
export function findRowIndices(rows: string[][], labels: string[]): number[] {
  return labels.map(label => rows.findIndex(r => r[0] === label)).filter(i => i !== -1);
}

/**
 * Off-DOM Plotly sankey render pipeline: create an offscreen container, render the sankey, run the
 * caller's patch callback (gradient defs + arrow-node styling — genuinely different per module, so
 * this stays a callback rather than being generalized further), serialize the patched SVG, and
 * rasterize it via `svgToJpeg`. `Plotly.toImage` can't be used for sankeys because it only clones
 * the graph from data/layout — it can't see the DOM-level SVG patches applied after render.
 * Every module's chart service previously inlined this exact shell (compressed air had already
 * factored its own private copy) — centralized here so gradient/arrow logic is the only thing left
 * that's module-specific.
 */
export async function renderSankeyToImage(
  plotlyService: PlotlyService,
  sankeyData: object,
  layout: object,
  applyPatches: (container: Element) => void,
  width = 1400,
  height = 400,
): Promise<string> {
  const container = document.createElement('div');
  container.style.cssText = `position:absolute;left:-9999px;top:-9999px;width:${width}px;height:${height}px`;
  document.body.appendChild(container);

  const plotly = await plotlyService.getPlotly();
  try {
    await plotly.newPlot(container, [sankeyData], layout, { displaylogo: false, displayModeBar: false, responsive: false });
    applyPatches(container);

    const svgEl = container.querySelector('.main-svg') as SVGSVGElement | null;
    if (!svgEl) throw new Error('Sankey render: .main-svg not found after render');
    svgEl.setAttribute('width', String(width));
    svgEl.setAttribute('height', String(height));
    const svgString = new XMLSerializer().serializeToString(svgEl);
    return await svgToJpeg(svgString, width, height);
  } finally {
    plotly.purge(container);
    document.body.removeChild(container);
  }
}
