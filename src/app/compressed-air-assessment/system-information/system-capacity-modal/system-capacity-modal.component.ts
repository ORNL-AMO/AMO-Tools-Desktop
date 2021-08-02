import { Component, ElementRef, EventEmitter, HostListener, Input, OnInit, Output, ViewChild } from '@angular/core';
import { ModalDirective } from 'ngx-bootstrap';
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

  @ViewChild('systemCapacityModal', { static: false }) public systemCapacityModal: ModalDirective;
  constructor(private convertUnitsService: ConvertUnitsService) { }

  ngOnInit(): void {
  }

  ngAfterViewInit() {
    this.systemCapacityModal.show();
  }
  
  setSystemCapacity(totalCapacity: number) {
    if (this.settings.unitsOfMeasure == 'Imperial') {
      totalCapacity = this.convertUnitsService.value(totalCapacity).from('ft3').to('gal');
    } else {
      totalCapacity = this.convertUnitsService.value(totalCapacity).from('m3').to('L')
    }
    this.totalCapacityOfCompressedAirSystem =  Number(totalCapacity.toFixed(1));
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
