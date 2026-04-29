import { ReportSection } from './report-section.model';

export interface ReportMeta {
  title: string;
  subtitle?: string;
  facilityName?: string;
  /** ISO date string */
  date: string;
  generatedBy?: string;
  units?: string;
  /** RGB tuple used for header fills, accent lines, and emphasis text in the rendered output */
  moduleColor?: [number, number, number];
}

export interface ReportDocument {
  meta: ReportMeta;
  sections: ReportSection[];
}
