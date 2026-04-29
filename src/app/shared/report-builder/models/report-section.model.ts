export type ReportSectionType = 'text' | 'key-value-list' | 'summary-table' | 'chart' | 'divider';

export interface ReportSection {
  type: ReportSectionType;
  title?: string;
  pageBreakBefore?: boolean;
}

export interface TextSection extends ReportSection {
  type: 'text';
  content: string;
}

export interface KeyValueSection extends ReportSection {
  type: 'key-value-list';
  rows: Array<{ label: string; value: string; unit?: string }>;
}

export interface SummaryTableSection extends ReportSection {
  type: 'summary-table';
  headers: string[];
  rows: string[][];
  emphasisRowsIndices?: number[];
  subGroupHeaderIndicies?: number[];
}

export interface ChartSection extends ReportSection {
  type: 'chart';
  /**
   * DOM element id that html2canvas will capture at export time.
   * The element must be visible in the DOM when export is triggered.
   */
  elementId: string;
  /** Fallback table for formats that cannot embed images (PPTX, XLSX) */
  altData?: SummaryTableSection;
}

export interface DividerSection extends ReportSection {
  type: 'divider';
}
