import { Injectable } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { PurchaseInformationData } from '../../../motor-inventory';

@Injectable()
export class PurchaseInformationDataService {

  constructor(private formBuilder: UntypedFormBuilder) { }

  getFormFromPurchaseInformationData(purchaseInformationData: PurchaseInformationData): UntypedFormGroup {
    return this.formBuilder.group({
      catalogId: [purchaseInformationData.catalogId],
      listPrice: [purchaseInformationData.listPrice, [Validators.min(0)]],
      warranty: [purchaseInformationData.warranty],
      directReplacementCost: [purchaseInformationData.directReplacementCost, [Validators.min(0)]]
    });
  }

  updatePurchaseInformationDataFromForm(form: UntypedFormGroup, purchaseInformationData: PurchaseInformationData): PurchaseInformationData {
    purchaseInformationData.catalogId = form.controls.catalogId.value;
    purchaseInformationData.listPrice = form.controls.listPrice.value;
    purchaseInformationData.warranty = form.controls.warranty.value;
    purchaseInformationData.directReplacementCost = form.controls.directReplacementCost.value;
    return purchaseInformationData;
  }
}
