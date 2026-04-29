import { Observable } from 'rxjs';
import { ReportDocument, ReportMeta } from '../models/report-document.model';

export interface ReportDataAdapter {
  buildDocument(meta: ReportMeta): Observable<ReportDocument>;
}
