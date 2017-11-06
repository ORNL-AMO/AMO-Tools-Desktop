import { Component, OnInit, ViewChild, Output, EventEmitter } from '@angular/core';
import { ModalDirective } from 'ngx-bootstrap';
declare const packageJson;
@Component({
  selector: 'app-version-modal',
  templateUrl: './version-modal.component.html',
  styleUrls: ['./version-modal.component.css']
})
export class VersionModalComponent implements OnInit {
  @Output('closeModal')
  closeModal = new EventEmitter<boolean>();

  @ViewChild('versionModal') public versionModal: ModalDirective;
  versionNum: any;
  constructor() { }

  ngOnInit() {

    this.versionNum = packageJson.version;
  }
  ngAfterViewInit() {
    this.showVersionModal();
  }


  showVersionModal() {
    this.versionModal.show();
  }

  hideVersionModal() {
    this.versionModal.hide();
    this.closeModal.emit(true);
  }

}
