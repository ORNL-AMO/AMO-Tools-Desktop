import { Component, OnInit, ViewChild, Input, SimpleChanges } from '@angular/core';
import { ModalDirective } from 'ng2-bootstrap';
import { ElectronService } from 'ngx-electron';

declare var autoUpdater: any;

@Component({
  selector: 'app-core',
  templateUrl: './core.component.html',
  styleUrls: ['./core.component.css']
})

export class CoreComponent implements OnInit {
  updateAvailable: boolean;
  downloadComplete: boolean;
  
  @ViewChild('updateModal') public updateModal: ModalDirective;
  constructor(private ElectronService: ElectronService) { }

  ngOnInit() {
    this.ElectronService.ipcRenderer.on('available', (event, arg) => {
      console.log('arg response: ' + arg);
      if(arg == true){
        this.showUpdateModal();
      }
    });

    if(this.updater()) {
      this.downloadComplete = true;
    }


    this.ElectronService.ipcRenderer.send('ready', null);
  }


  showUpdateModal() {
    this.updateModal.show();
  }

  hideUpdateModal() {
    this.updateModal.hide();
  }

  updateSelected() {
    this.ElectronService.ipcRenderer.send('update', null);
  }

  later() {
    this.updateModal.hide();
    this.ElectronService.ipcRenderer.send('later', null);
  }

  updater() {
    autoUpdater.on('update-downloaded', (event, info) => {
    })
  }
}
