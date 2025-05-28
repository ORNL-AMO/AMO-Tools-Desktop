import { Component, OnInit } from '@angular/core';
import { FluidPropertiesOptions, PumpInventoryData } from '../../../pump-inventory';
import { PumpInventoryService } from '../../../pump-inventory.service';

@Component({
    selector: 'app-fluid-properties',
    templateUrl: './fluid-properties.component.html',
    styleUrls: ['./fluid-properties.component.css'],
    standalone: false
})
export class FluidPropertiesComponent implements OnInit {
  displayForm: boolean;
  fluidPropertiesOptions: FluidPropertiesOptions;
  constructor(private pumpInventoryService: PumpInventoryService) { }

  ngOnInit(): void {
    this.fluidPropertiesOptions = this.pumpInventoryService.pumpInventoryData.getValue().displayOptions.fluidPropertiesOptions;
    this.displayForm = this.fluidPropertiesOptions.displayFluidProperties;
  }

  save() {
    let pumpInventoryService: PumpInventoryData = this.pumpInventoryService.pumpInventoryData.getValue();
    this.checkDisplayFields();
    pumpInventoryService.displayOptions.fluidPropertiesOptions = this.fluidPropertiesOptions;
    this.pumpInventoryService.pumpInventoryData.next(pumpInventoryService);
  }

  toggleForm() {
    this.displayForm = !this.displayForm;
  }

  setAll() {
    this.fluidPropertiesOptions.fluidType = this.fluidPropertiesOptions.displayFluidProperties;
    this.fluidPropertiesOptions.fluidDensity = this.fluidPropertiesOptions.displayFluidProperties;
    this.save();
  }

  checkDisplayFields() {
    this.fluidPropertiesOptions.displayFluidProperties = (
      this.fluidPropertiesOptions.fluidType ||
      this.fluidPropertiesOptions.fluidDensity
    );
  }

  focusField(str: string){
    this.focusGroup();
    this.pumpInventoryService.focusedField.next(str);
  }

  focusGroup(){
    this.pumpInventoryService.focusedDataGroup.next('fluid-properties');
  }
}
