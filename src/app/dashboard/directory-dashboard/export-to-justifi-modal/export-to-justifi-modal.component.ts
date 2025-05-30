import { Component, ViewChild } from '@angular/core';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { DirectoryDashboardService } from '../directory-dashboard.service';

@Component({
  selector: 'app-export-to-justifi-modal',
  templateUrl: './export-to-justifi-modal.component.html',
  styleUrl: './export-to-justifi-modal.component.css',
  standalone: false
})
export class ExportToJustifiModalComponent {

  @ViewChild('exportToJustifiModal', { static: false }) public exportToJustifiModal: ModalDirective;
  constructor(private directoryDashboardService: DirectoryDashboardService) { }

  ngOnInit() {
  }

  ngAfterViewInit() {
    this.showModal();
  }

  showModal() {
    this.exportToJustifiModal.show();
  }

  hideModal() {
    this.exportToJustifiModal.hide();
    this.exportToJustifiModal.onHidden.subscribe(val => {
      this.directoryDashboardService.showExportToJustifiModal.next(false);
    });
  }


}
