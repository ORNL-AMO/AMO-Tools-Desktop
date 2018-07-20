import { Component, OnInit, ViewChild, Output, EventEmitter, ChangeDetectorRef } from '@angular/core';
import { ModalDirective } from 'ngx-bootstrap';
import { ElectronService } from 'ngx-electron';
@Component({
  selector: 'app-update-modal',
  templateUrl: './update-modal.component.html',
  styleUrls: ['./update-modal.component.css']
})
export class UpdateModalComponent implements OnInit {
  @Output('closeModal')
  closeModal = new EventEmitter<boolean>();

  @ViewChild('updateModal') public updateModal: ModalDirective;
  updateAvailable: boolean;
  updateSelected: boolean = false;
  constructor(private electronService: ElectronService, private cd: ChangeDetectorRef) { }

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
    },500)
  }

  cancel() {
    this.hideUpdateModal();
    //this.electronService.ipcRenderer.send('later', null);
  }
}
