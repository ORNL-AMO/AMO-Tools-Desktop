import { Component, OnInit } from '@angular/core';
import { PurchaseInformationOptions, MotorInventoryData } from '../../../motor-inventory';
import { MotorInventoryService } from '../../../motor-inventory.service';

@Component({
    selector: 'app-purchase-information-properties',
    templateUrl: './purchase-information-properties.component.html',
    styleUrls: ['./purchase-information-properties.component.css'],
    standalone: false
})
export class PurchaseInformationPropertiesComponent implements OnInit {

  displayForm: boolean;
  purchaseInformationOptions: PurchaseInformationOptions;
  constructor(private motorInventoryService: MotorInventoryService) { }

  ngOnInit(): void {
    this.purchaseInformationOptions = this.motorInventoryService.motorInventoryData.getValue().displayOptions.purchaseInformationOptions;
    this.displayForm = this.purchaseInformationOptions.displayPurchaseInformation;
  }

  save() {
    let motorInventoryData: MotorInventoryData = this.motorInventoryService.motorInventoryData.getValue();
    this.checkDisplayPurchaseInformation();
    motorInventoryData.displayOptions.purchaseInformationOptions = this.purchaseInformationOptions;
    this.motorInventoryService.motorInventoryData.next(motorInventoryData);
  }

  toggleForm(){
    this.displayForm = !this.displayForm;
  }

  setAll(){
    this.purchaseInformationOptions.catalogId = this.purchaseInformationOptions.displayPurchaseInformation;
    this.purchaseInformationOptions.directReplacementCost = this.purchaseInformationOptions.displayPurchaseInformation;
    this.purchaseInformationOptions.listPrice = this.purchaseInformationOptions.displayPurchaseInformation;
    this.purchaseInformationOptions.warranty = this.purchaseInformationOptions.displayPurchaseInformation;
    this.save();
  }

  checkDisplayPurchaseInformation(){
    this.purchaseInformationOptions.displayPurchaseInformation = (
      this.purchaseInformationOptions.catalogId ||
      this.purchaseInformationOptions.directReplacementCost ||
      this.purchaseInformationOptions.listPrice ||
      this.purchaseInformationOptions.warranty
    )
  }
  focusField(str: string){
    this.focusGroup();
    this.motorInventoryService.focusedField.next(str);
  }

  focusGroup(){
    this.motorInventoryService.focusedDataGroup.next('purchase-information');
  }
}
