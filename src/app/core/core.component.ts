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
  downloadComplete: boolean;
  
  @ViewChild('updateModal') public updateModal: ModalDirective;
  constructor(private ElectronService: ElectronService) { }

  ngOnInit() {

    this.ElectronService.ipcRenderer.once('available', (event, arg) => {
      console.log('Update Availble: ' + arg);
      if(arg == true){
        this.showUpdateModal();
      }
    })

    this.ElectronService.ipcRenderer.once('downloadDone', (event, arg) => {
      if(arg == true){
        this.downloadComplete = true;
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
    this.ElectronService.ipcRenderer.send('update', null);
    this.updateAvailable = false;
    this.ElectronService.ipcRenderer.send('finished', null);
  }

  later() {
    this.updateModal.hide();
    this.ElectronService.ipcRenderer.send('later', null);
  }

  quitAndInstall() {
    this.ElectronService.ipcRenderer.send('exit', null);
  }

  installLater() {
    this.updateModal.hide();
  }
}
