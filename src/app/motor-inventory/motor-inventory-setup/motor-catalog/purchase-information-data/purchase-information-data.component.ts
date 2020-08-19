import { Component, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Subscription } from 'rxjs';
import { PurchaseInformationOptions, MotorItem } from '../../../motor-inventory';
import { MotorCatalogService } from '../motor-catalog.service';
import { MotorInventoryService } from '../../../motor-inventory.service';
import { PurchaseInformationDataService } from './purchase-information-data.service';

@Component({
  selector: 'app-purchase-information-data',
  templateUrl: './purchase-information-data.component.html',
  styleUrls: ['./purchase-information-data.component.css']
})
export class PurchaseInformationDataComponent implements OnInit {
 
  motorForm: FormGroup;
  selectedMotorItemSub: Subscription;
  displayOptions: PurchaseInformationOptions;
  displayForm: boolean = true;
  constructor(private motorCatalogService: MotorCatalogService, private motorInventoryService: MotorInventoryService,
    private purchaseInformationDataService: PurchaseInformationDataService) { }

  ngOnInit(): void {
    this.selectedMotorItemSub = this.motorCatalogService.selectedMotorItem.subscribe(selectedMotor => {
      if (selectedMotor) {
        this.motorForm = this.purchaseInformationDataService.getFormFromPurchaseInformationData(selectedMotor.purchaseInformationData);
      }
    });
    this.displayOptions = this.motorInventoryService.motorInventoryData.getValue().displayOptions.purchaseInformationOptions;
  }

  ngOnDestroy() {
    this.selectedMotorItemSub.unsubscribe();
  }

  save() {
    let selectedMotor: MotorItem = this.motorCatalogService.selectedMotorItem.getValue();
    selectedMotor.purchaseInformationData = this.purchaseInformationDataService.updatePurchaseInformationDataFromForm(this.motorForm, selectedMotor.purchaseInformationData);
    this.motorInventoryService.updateMotorItem(selectedMotor);
  }

  focusField(str: string) {
    this.motorInventoryService.focusedDataGroup.next('purchase-information');
    this.motorInventoryService.focusedField.next(str);
  }

  toggleForm() {
    this.displayForm = !this.displayForm;
  }

}
