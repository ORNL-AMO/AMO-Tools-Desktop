import { Component, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Subscription } from 'rxjs';
import { OperationDataOptions, MotorItem } from '../../../motor-inventory';
import { MotorCatalogService } from '../motor-catalog.service';
import { MotorInventoryService } from '../../../motor-inventory.service';
import { OperationsDataService } from './operations-data.service';

@Component({
  selector: 'app-operations-data',
  templateUrl: './operations-data.component.html',
  styleUrls: ['./operations-data.component.css']
})
export class OperationsDataComponent implements OnInit {

  motorForm: FormGroup;
  selectedMotorItemSub: Subscription;
  displayOptions: OperationDataOptions;
  displayForm: boolean = true;
  constructor(private motorCatalogService: MotorCatalogService, private motorInventoryService: MotorInventoryService,
    private operationsDataService: OperationsDataService) { }

  ngOnInit(): void {
    this.selectedMotorItemSub = this.motorCatalogService.selectedMotorItem.subscribe(selectedMotor => {
      if (selectedMotor) {
        this.motorForm = this.operationsDataService.getFormFromOperationData(selectedMotor.operationData);
      }
    });
    this.displayOptions = this.motorInventoryService.motorInventoryData.getValue().displayOptions.operationDataOptions;
  }

  ngOnDestroy() {
    this.selectedMotorItemSub.unsubscribe();
  }

  save() {
    let selectedMotor: MotorItem = this.motorCatalogService.selectedMotorItem.getValue();
    selectedMotor.operationData = this.operationsDataService.updateOperationDataFromForm(this.motorForm, selectedMotor.operationData);
    this.motorInventoryService.updateMotorItem(selectedMotor);
  }

  focusField(str: string) {
    this.motorInventoryService.focusedDataGroup.next('operation-data');
    this.motorInventoryService.focusedField.next(str);
  }

  toggleForm(){
    this.displayForm = !this.displayForm;
  }

}
