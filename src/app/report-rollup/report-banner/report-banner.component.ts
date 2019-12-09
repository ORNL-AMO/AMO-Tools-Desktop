import { Component, OnInit, EventEmitter, Output } from '@angular/core';
import { DirectoryDashboardService } from '../../dashboard/directory-dashboard/directory-dashboard.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-report-banner',
  templateUrl: './report-banner.component.html',
  styleUrls: ['./report-banner.component.css']
})
export class ReportBannerComponent implements OnInit {
  @Output('emitExport')
  emitExport = new EventEmitter<boolean>();
  @Output('emitPrint')
  emitPrint = new EventEmitter<boolean>();
  @Output('emitShowUnitModal')
  emitShowUnitModal = new EventEmitter<boolean>();

  constructor(private directoryDashboardService: DirectoryDashboardService, private router: Router) { }

  ngOnInit() {
  }

  closeReport() {
    let directoryId: number = this.directoryDashboardService.selectedDirectoryId.getValue();
    this.router.navigateByUrl('/directory-dashboard/' + directoryId);
  }

  exportToCsv() {
    this.emitExport.emit(true);
  }

  print() {
    this.emitPrint.emit(true);
  }

  showUnitsModal() {
    this.emitShowUnitModal.emit(true);
  }

}
