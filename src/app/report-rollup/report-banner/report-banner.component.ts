import { Component, OnInit } from '@angular/core';
import { DirectoryDashboardService } from '../../dashboard/directory-dashboard/directory-dashboard.service';
import { Router } from '@angular/router';
import { ReportRollupService } from '../report-rollup.service';
import { PrintOptionsMenuService } from '../../shared/print-options-menu/print-options-menu.service';

@Component({
    selector: 'app-report-banner',
    templateUrl: './report-banner.component.html',
    styleUrls: ['./report-banner.component.css'],
    standalone: false
})
export class ReportBannerComponent implements OnInit {

  constructor(private directoryDashboardService: DirectoryDashboardService, private router: Router,
    private printOptionsMenuService: PrintOptionsMenuService, private reportRollupService: ReportRollupService) { }

  ngOnInit() {
  }

  closeReport() {
    let directoryId: number = this.directoryDashboardService.selectedDirectoryId.getValue();
    this.router.navigateByUrl('/directory-dashboard/' + directoryId);
  }

  showPrintModal() {
    this.printOptionsMenuService.showPrintMenu.next(true);
  }

  showUnitsModal() {
    this.reportRollupService.showSummaryModal.next('unitsModal');
  }

}
