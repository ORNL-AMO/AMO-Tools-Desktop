import { Component, OnInit, ViewChild, Output, EventEmitter, ChangeDetectorRef, Input } from '@angular/core';
import { ModalDirective } from 'ngx-bootstrap';
import { ElectronService } from 'ngx-electron';
import { ImportExportService } from '../shared/import-export/import-export.service';
@Component({
  selector: 'app-update-modal',
  templateUrl: './update-modal.component.html',
  styleUrls: ['./update-modal.component.css']
})
export class UpdateModalComponent implements OnInit {
  @Output('closeModal')
  closeModal = new EventEmitter<boolean>();
  @Input()
  updateError: boolean;

  @ViewChild('updateModal') public updateModal: ModalDirective;
  updateAvailable: boolean;
  updateSelected: boolean = false;
  constructor(private electronService: ElectronService, private cd: ChangeDetectorRef, private importExportService: ImportExportService) { }

  ngOnInit() {

  }
  ngAfterViewInit() {
    this.showUpdateModal();
  }


  showUpdateModal() {
    this.updateModal.show();
  }

  hideUpdateModal() {
    this.updateModal.hide();
    this.closeModal.emit(true);
  }

  updateClick() {
    this.updateAvailable = false;
    this.updateSelected = true;
    this.cd.detectChanges();
    setTimeout(() => {
      this.electronService.ipcRenderer.send('update', null);
      setTimeout(() => {
        this.updateError = true;
      }, 120000)
    }, 500);
  }

  cancel() {
    this.hideUpdateModal();
    //this.electronService.ipcRenderer.send('later', null);
  }

  sendMail() {
    this.importExportService.openMailTo();
  }
}
