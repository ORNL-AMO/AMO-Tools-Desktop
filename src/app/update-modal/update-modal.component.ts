import { Component, OnInit, ViewChild, Input } from '@angular/core';
import { ModalDirective } from 'ng2-bootstrap';
import { ElectronService } from 'ngx-electron';
@Component({
  selector: 'app-update-modal',
  templateUrl: 'update-modal.component.html',
  styleUrls: ['update-modal.component.css']
})
export class UpdateModalComponent implements OnInit {
  @ViewChild('updateModal') public updateModal: ModalDirective;

  constructor(private ElectronService: ElectronService) { }

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
  }

  update() {
    this.ElectronService.ipcRenderer.send('update');
  }

  later() {
    this.ElectronService.ipcRenderer.send('later');
    this.updateModal.hide();
  }

}
