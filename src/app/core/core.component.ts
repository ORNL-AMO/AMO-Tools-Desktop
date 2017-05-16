import { Component, OnInit, ViewChild, Input, SimpleChanges } from '@angular/core';
import { ModalDirective } from 'ng2-bootstrap';
import { ElectronService } from 'ngx-electron';

@Component({
  selector: 'app-core',
  templateUrl: './core.component.html',
  styleUrls: ['./core.component.css']
})

export class CoreComponent implements OnInit {
  updateAvailable: boolean;
  updateSelected: boolean;

  @ViewChild('updateModal') public updateModal: ModalDirective;

  constructor(private ElectronService: ElectronService) {
  }

  ngOnInit() {
    this.ElectronService.ipcRenderer.once('available', (event, arg) => {
      if (arg == true) {
        this.showUpdateModal();
      }
    })

    this.ElectronService.ipcRenderer.send('ready', null);
  }

  showUpdateModal() {
    this.updateModal.show();
  }

  hideUpdateModal() {
    this.updateModal.hide();
  }

  updateClick() {
    this.updateSelected = true;
    this.updateAvailable = false;
    this.ElectronService.ipcRenderer.send('update', null);
  }

  cancel() {
    this.updateModal.hide();
    this.ElectronService.ipcRenderer.send('later', null);
  }
}
