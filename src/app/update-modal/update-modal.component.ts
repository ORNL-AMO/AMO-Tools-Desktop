import { Component, OnInit, ViewChild, Input, SimpleChanges } from '@angular/core';
import { ModalDirective } from 'ng2-bootstrap';
import { ElectronService } from 'ngx-electron';

@Component({
  selector: 'app-update-modal',
  templateUrl: 'update-modal.component.html',
  styleUrls: ['update-modal.component.css']
})
export class UpdateModalComponent implements OnInit {
  @Input()
  updateAvailable: boolean;

  @ViewChild('updateModal') public updateModal: ModalDirective;

  constructor(private ElectronService: ElectronService) { }

  ngOnChanges(changes: SimpleChanges){
    if(changes.updateAvailable){
      if(changes.updateAvailable.currentValue == true){
        this.showUpdateModal();
      }
    }
  }

  ngOnInit() {

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
