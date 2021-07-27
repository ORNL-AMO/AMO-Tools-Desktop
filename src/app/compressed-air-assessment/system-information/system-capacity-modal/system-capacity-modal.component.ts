import { Component, ElementRef, EventEmitter, HostListener, OnInit, Output, ViewChild } from '@angular/core';
import { ModalDirective } from 'ngx-bootstrap';

@Component({
  selector: 'app-system-capacity-modal',
  templateUrl: './system-capacity-modal.component.html',
  styleUrls: ['./system-capacity-modal.component.css']
})
export class SystemCapacityModalComponent implements OnInit {
  @Output('closeModal')
  closeModal = new EventEmitter<number>();
  totalCapacityOfCompressedAirSystem: number;

  @ViewChild('systemCapacityModal', { static: false }) public systemCapacityModal: ModalDirective;
  constructor() { }

  ngOnInit(): void {
  }

  ngAfterViewInit() {
    this.systemCapacityModal.show();
  }
  
  setSystemCapacity(totalCapacity: number) {
    this.totalCapacityOfCompressedAirSystem = totalCapacity;
  }

  closeSystemCapacityModal() {
    this.closeModal.emit(undefined);
    this.systemCapacityModal.hide();
  }
  
  saveSystemCapacity() {
    this.closeModal.emit(this.totalCapacityOfCompressedAirSystem);
    this.systemCapacityModal.hide();
  }

}
