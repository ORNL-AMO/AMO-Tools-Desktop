import { Component, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Subscription } from 'rxjs';
import { ManualSpecificationOptions, MotorItem } from '../../../motor-inventory';
import { MotorCatalogService } from '../motor-catalog.service';
import { MotorInventoryService } from '../../../motor-inventory.service';
import { ManualSpecificationDataService } from './manual-specification-data.service';

@Component({
  selector: 'app-manual-specification-data',
  templateUrl: './manual-specification-data.component.html',
  styleUrls: ['./manual-specification-data.component.css']
})
export class ManualSpecificationDataComponent implements OnInit {

  motorForm: FormGroup;
  selectedMotorItemSub: Subscription;
  displayOptions: ManualSpecificationOptions;
  displayForm: boolean = true;
  constructor(private motorCatalogService: MotorCatalogService, private motorInventoryService: MotorInventoryService,
    private manualSpecificationDataService: ManualSpecificationDataService) { }

  ngOnInit(): void {
    this.selectedMotorItemSub = this.motorCatalogService.selectedMotorItem.subscribe(selectedMotor => {
      if (selectedMotor) {
        this.motorForm = this.manualSpecificationDataService.getFormFromManualSpecificationData(selectedMotor.manualSpecificationData);
      }
    });
    this.displayOptions = this.motorInventoryService.motorInventoryData.getValue().displayOptions.manualSpecificationOptions;
  }

  ngOnDestroy() {
    this.selectedMotorItemSub.unsubscribe();
  }

  save() {
    let selectedMotor: MotorItem = this.motorCatalogService.selectedMotorItem.getValue();
    selectedMotor.manualSpecificationData = this.manualSpecificationDataService.updateManualDataFromForm(this.motorForm, selectedMotor.manualSpecificationData);
    this.motorInventoryService.updateMotorItem(selectedMotor);
  }

  focusField(str: string) {
    this.motorInventoryService.focusedField.next(str);
  }

  toggleForm(){
    this.displayForm = !this.displayForm;
  }

}
