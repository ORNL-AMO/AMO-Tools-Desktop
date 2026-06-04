import { Observable } from 'rxjs';
import { ReportDocument } from '../models/report-document.model';
import { Assessment } from '../../models/assessment';

export interface ReportDataAdapter {
  buildDocument(assessment: Assessment): Observable<ReportDocument>;
}
