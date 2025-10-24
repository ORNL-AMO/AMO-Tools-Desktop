import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Settings } from '../../../../shared/models/settings';
import { ConvertUnitsService } from '../../../../shared/convert-units/convert-units.service';

@Component({
  selector: 'app-system-capacity-inventory-modal',
  templateUrl: './system-capacity-inventory-modal.component.html',
  styleUrl: './system-capacity-inventory-modal.component.css',
  standalone: false
})
export class SystemCapacityInventoryModalComponent implements OnInit {
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