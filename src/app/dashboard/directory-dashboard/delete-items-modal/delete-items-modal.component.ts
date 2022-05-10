import { Component, OnInit, ViewChild } from '@angular/core';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { DirectoryDashboardService } from '../directory-dashboard.service';
import { DeleteDataService } from '../../../indexedDb/delete-data.service';
import { Directory } from '../../../shared/models/directory';
import { DirectoryDbService } from '../../../indexedDb/directory-db.service';
import { DashboardService } from '../../dashboard.service';

@Component({
  selector: 'app-delete-items-modal',
  templateUrl: './delete-items-modal.component.html',
  styleUrls: ['./delete-items-modal.component.css']
})
export class DeleteItemsModalComponent implements OnInit {

  @ViewChild('deleteItemsModal', { static: false }) public deleteItemsModal: ModalDirective;
  deleting: boolean = false;
  constructor(private directoryDashboardService: DirectoryDashboardService, private deleteDataService: DeleteDataService,
    private directoryDbService: DirectoryDbService, private dashboardService: DashboardService) { }

  ngOnInit() {
  }

  ngAfterViewInit() {
    this.showDeleteItemsModal();
  }

  showDeleteItemsModal() {
    this.deleteItemsModal.show();
  }

  hideDeleteItemsModal() {
    this.deleteItemsModal.hide();
    this.deleteItemsModal.onHidden.subscribe(val => {
      this.directoryDashboardService.showDeleteItemsModal.next(false);
    });
  }

  deleteSelected() {
    this.deleting = true;
    let directoryId: number = this.directoryDashboardService.selectedDirectoryId.getValue();
    let directory: Directory = this.directoryDbService.getById(directoryId)
    this.deleteDataService.deleteDirectory(directory, true);
    setTimeout(() => {
      this.dashboardService.updateDashboardData.next(true);
      this.deleting = false;
      this.hideDeleteItemsModal();
    }, 1500);
  }
}
