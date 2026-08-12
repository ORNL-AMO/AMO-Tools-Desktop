import { ReportDocument } from '../models/report-document.model';

export abstract class BaseReportService {
  abstract export(document: ReportDocument, filename: string): Promise<void>;
}
