export type ReportSectionType = 'text' | 'key-value-list' | 'summary-table' | 'chart';

export interface ReportSection {
  type: ReportSectionType;
  title?: string;
  pageBreakBefore?: boolean;
  group?: string;
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
  subGroupHeaderIndices?: number[];
}

export interface ChartSection extends ReportSection {
  type: 'chart';
  /**
   * Optional async provider that returns a PNG data URL.
   * Chart sections must provide this to generate images for PDF export.
   */
  imageDataProvider?: () => Promise<string>;
  /** Fallback table for formats that cannot embed images (PPTX, XLSX) */
  altData?: SummaryTableSection;
}
