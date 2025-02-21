import { Component, EventEmitter, Output, ViewChild } from '@angular/core';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-release-notes-modal',
  templateUrl: './release-notes-modal.component.html',
  styleUrl: './release-notes-modal.component.css'
})
export class ReleaseNotesModalComponent {
@Output('closeModal')
  closeModal = new EventEmitter<boolean>();

  @ViewChild('releaseNotesModal', { static: false }) public releaseNotesModal: ModalDirective;
  versionNum: any;
  constructor() { }

  ngOnInit() {
    this.versionNum = environment.version;
  }
  
  ngAfterViewInit() {
    this.showModal();
  }

  showModal() {
    this.releaseNotesModal.show();
  }

  hideModal() {
    this.releaseNotesModal.hide();
    this.closeModal.emit(true);
  }

}
