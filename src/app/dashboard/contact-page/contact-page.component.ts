import { Component, OnInit } from '@angular/core';
import { ImportExportService } from '../../shared/import-export/import-export.service';
import { ExportService } from '../../shared/import-export/export.service';
import { DirectoryDashboardService } from '../directory-dashboard/directory-dashboard.service';
@Component({
    selector: 'app-contact-page',
    templateUrl: './contact-page.component.html',
    styleUrls: ['./contact-page.component.css'],
    standalone: false
})
export class ContactPageComponent implements OnInit {

  constructor(private importExportService: ImportExportService, private exportService: ExportService, private directoryDashboardService: DirectoryDashboardService) { }

  ngOnInit() {
  }

  sendMail() {
    this.importExportService.openMailTo();
  }

  downloadData() {
    this.exportService.exportAll = true;
    this.directoryDashboardService.showExportModal.next(true);
  }

}
