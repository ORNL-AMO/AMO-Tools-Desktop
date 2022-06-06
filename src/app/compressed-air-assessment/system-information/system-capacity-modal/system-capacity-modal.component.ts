import { Component, ElementRef, EventEmitter, HostListener, Input, OnInit, Output, ViewChild } from '@angular/core';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { ConvertUnitsService } from '../../../shared/convert-units/convert-units.service';
import { Settings } from '../../../shared/models/settings';

@Component({
  selector: 'app-system-capacity-modal',
  templateUrl: './system-capacity-modal.component.html',
  styleUrls: ['./system-capacity-modal.component.css']
})
export class SystemCapacityModalComponent implements OnInit {
  @Output('closeModal')
  closeModal = new EventEmitter<number>();
  @Input()
  settings: Settings;
  totalCapacityOfCompressedAirSystem: number;

  constructor(private convertUnitsService: ConvertUnitsService) { }

  ngOnInit(): void {
  }
  
  setSystemCapacity(totalCapacity: number) {
    if (this.settings.unitsOfMeasure == 'Metric') {
      totalCapacity = this.convertUnitsService.value(totalCapacity).from('m3').to('L')
    }
    this.totalCapacityOfCompressedAirSystem =  Number(totalCapacity.toFixed(1));
  }

  closeSystemCapacityModal() {
    this.closeModal.emit(undefined);
  }
  
  saveSystemCapacity() {
    this.closeModal.emit(this.totalCapacityOfCompressedAirSystem);
  }

}
