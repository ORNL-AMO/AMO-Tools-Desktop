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
 
  @ViewChild('updateModal') public updateModal: ModalDirective;
  constructor(private ElectronService: ElectronService) { }

  ngOnInit() {
    this.ElectronService.ipcRenderer.on('available', (event, arg) => {
      console.log('arg response: ' + arg);
      if(arg == true){
        this.showUpdateModal();
      }
    });
    this.ElectronService.ipcRenderer.send('ready', null);
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
