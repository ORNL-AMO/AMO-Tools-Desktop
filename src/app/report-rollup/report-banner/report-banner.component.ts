import { Component, OnInit, EventEmitter, Output } from '@angular/core';
import { DirectoryDashboardService } from '../../dashboard/directory-dashboard/directory-dashboard.service';
import { Router } from '@angular/router';
import { RollupPrintService, RollupPrintOptions } from '../rollup-print.service';
import { Subscription } from 'rxjs';
import { WindowRefService } from '../../indexedDb/window-ref.service';
import { ReportRollupService } from '../report-rollup.service';

@Component({
  selector: 'app-report-banner',
  templateUrl: './report-banner.component.html',
  styleUrls: ['./report-banner.component.css']
})
export class ReportBannerComponent implements OnInit {
  // @Output('emitExport')
  // emitExport = new EventEmitter<boolean>();
  @Output('emitShowUnitModal')
  emitShowUnitModal = new EventEmitter<boolean>();


  constructor(private directoryDashboardService: DirectoryDashboardService, private router: Router,
    private rollupPrintService: RollupPrintService) { }

  ngOnInit() {
  }

  closeReport() {
    let directoryId: number = this.directoryDashboardService.selectedDirectoryId.getValue();
    this.router.navigateByUrl('/directory-dashboard/' + directoryId);
  }

  showPrintModal() {
    this.rollupPrintService.showPrintOptionsModal.next(true);
  }

  showUnitsModal() {
    this.emitShowUnitModal.emit(true);
  }

}
