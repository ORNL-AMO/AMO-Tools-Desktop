import { ChangeDetectionStrategy, Component } from '@angular/core';
import { REPORT_VIEW_LINKS } from '../models/views';

@Component({
  selector: 'app-report',
  standalone: false,
  templateUrl: './report.component.html',
  styleUrl: './report.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { style: 'height: 100%; display: flex; flex-direction: column; overflow: hidden;' }
})
export class ReportComponent {
  readonly REPORT_VIEW_LINKS = REPORT_VIEW_LINKS;
}
