import { Component, OnInit, ViewChild, Input } from '@angular/core';
import { ModalDirective } from 'ng2-bootstrap';
@Component({
  selector: 'app-update-modal',
  templateUrl: 'update-modal.component.html',
  styleUrls: ['update-modal.component.css']
})
export class UpdateModalComponent implements OnInit {
  @ViewChild('updateModal') public updateModal: ModalDirective;

  constructor() { }

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

}
