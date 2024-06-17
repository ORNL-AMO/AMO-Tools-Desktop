import { Component } from '@angular/core';
import { Co2SavingsData } from '../calculator/utilities/co2-savings/co2-savings.service';

export interface CompressedAirInventoryData {
  co2SavingsData?: Co2SavingsData,
 // departments: Array<PumpInventoryDepartment>,
  //displayOptions: PumpPropertyDisplayOptions,
  hasConnectedInventoryItems?: boolean,
  hasConnectedPsat?: boolean,
  isValid?: boolean,
  existingDataUnits?: string
}


@Component({
  selector: 'app-compressed-air-inventory',
  templateUrl: './compressed-air-inventory.component.html',
  styleUrl: './compressed-air-inventory.component.css'
})
export class CompressedAirInventoryComponent {

}
