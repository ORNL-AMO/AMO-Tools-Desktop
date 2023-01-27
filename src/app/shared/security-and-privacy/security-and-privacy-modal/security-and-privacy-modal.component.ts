import { Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-security-and-privacy-modal',
  templateUrl: './security-and-privacy-modal.component.html',
  styleUrls: ['./security-and-privacy-modal.component.css']
})
export class SecurityAndPrivacyModalComponent {
  @Output('emitModalClosed')
  modalClosed = new EventEmitter<boolean>();
  @ViewChild('noticeModal', { static: false }) public noticeModal: ModalDirective;
  onHiddenSubscription: Subscription;
  constructor() { }

  ngOnInit() {
  }
  
  ngOnDestroy() {
    if (this.onHiddenSubscription) {
      this.onHiddenSubscription.unsubscribe();
    }
  }
  
  ngAfterViewInit() {
    this.noticeModal.show();

    this.onHiddenSubscription = this.noticeModal.onHidden.subscribe(() => {
      this.close()
    });
  }

  close() {
    this.noticeModal.hide();
    this.modalClosed.emit(true)
  }
}
