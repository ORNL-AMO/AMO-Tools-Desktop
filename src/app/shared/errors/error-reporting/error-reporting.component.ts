import { Component, Input } from '@angular/core';
import { MeasurPlatformString } from '../../analytics/analytics.service';
import { environment } from '../../../../environments/environment';
import { MeasurFormattedError } from '../MeasurErrorHandler';
import { ExportService } from '../../import-export/export.service';
import { DirectoryDashboardService } from '../../../dashboard/directory-dashboard/directory-dashboard.service';

@Component({
  selector: 'app-error-reporting',
  templateUrl: './error-reporting.component.html',
  styleUrl: './error-reporting.component.css'
})
export class ErrorReportingComponent {
  @Input()
  measurFormattedError: MeasurFormattedError;
  measurPlatform: string = environment.name;
  appVersion: string = environment.version;

  constructor(private exportService: ExportService, private directoryDashboardService: DirectoryDashboardService) {}
  ngOnInit() {}

  downloadBackupData() {
    this.exportService.exportAll = true;
    this.directoryDashboardService.showExportModal.next(true);
  }

}
