import { Component, OnInit } from '@angular/core';
import { PumpInventoryData, PumpStatusOptions } from '../../../pump-inventory';
import { PumpInventoryService } from '../../../pump-inventory.service';

@Component({
    selector: 'app-pump-status-properties',
    templateUrl: './pump-status-properties.component.html',
    styleUrls: ['./pump-status-properties.component.css'],
    standalone: false
})
export class PumpStatusPropertiesComponent implements OnInit {
  displayForm: boolean;
  pumpStatusOptions: PumpStatusOptions;
  constructor(private pumpInventoryService: PumpInventoryService) { }

  ngOnInit(): void {
    this.pumpStatusOptions = this.pumpInventoryService.pumpInventoryData.getValue().displayOptions.pumpStatusOptions;
    this.displayForm = this.pumpStatusOptions.displayPumpStatus;
  }

  save() {
    let pumpInventoryService: PumpInventoryData = this.pumpInventoryService.pumpInventoryData.getValue();
    this.checkDisplayFields();
    pumpInventoryService.displayOptions.pumpStatusOptions = this.pumpStatusOptions;
    this.pumpInventoryService.pumpInventoryData.next(pumpInventoryService);
  }

  toggleForm() {
    this.displayForm = !this.displayForm;
  }

  setAll() {
    this.pumpStatusOptions.status = this.pumpStatusOptions.displayPumpStatus,
    this.pumpStatusOptions.priority = this.pumpStatusOptions.displayPumpStatus,
    this.pumpStatusOptions.yearInstalled = this.pumpStatusOptions.displayPumpStatus,
    this.save();
  }

  checkDisplayFields() {
    this.pumpStatusOptions.displayPumpStatus = (
      this.pumpStatusOptions.status ||
      this.pumpStatusOptions.priority ||
      this.pumpStatusOptions.yearInstalled
    );
  }
  focusField(str: string){
    this.focusGroup();
    this.pumpInventoryService.focusedField.next(str);
  }

  focusGroup(){
    this.pumpInventoryService.focusedDataGroup.next('pump-status');
  }
}
