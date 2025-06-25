import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { getNewIdString } from '../../shared/helperFunctions';
import { ChillerInventoryItem, CompressorChillerTypeEnum, ProcessCoolingAssessment } from '../../shared/models/process-cooling-assessment';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';

@Injectable({
  providedIn: 'root'
})
export class ChillerInventoryService {
  selectedChiller: BehaviorSubject<ChillerInventoryItem>;

  constructor(private formBuilder: UntypedFormBuilder) {
    this.selectedChiller = new BehaviorSubject<ChillerInventoryItem>(undefined);
  }


  getNewInventoryItem(): ChillerInventoryItem {
    return {
      itemId: getNewIdString(),
      name: 'New Chiller',
      description: undefined,
      modifiedDate: new Date(),
      // Add type values form cwsat
      compressorChillerType: 0,
      fullLoadEfficiency: 0,
      chillerCapacity: 0,
    }
  }

  setDefaultSelectedChiller(inventory: ChillerInventoryItem[]) {
    if (inventory && inventory.length > 0) {
      let lastItemModified: ChillerInventoryItem = this.getLastModifiedInventory(inventory);
      this.selectedChiller.next(lastItemModified);
    } else {
      this.selectedChiller.next(undefined);
    } 
  }

  getLastModifiedInventory(inventory: ChillerInventoryItem[]): ChillerInventoryItem { 
    return inventory.reduce((prev, current) => {
        return (prev.modifiedDate > current.modifiedDate) ? prev : current;
      });
  }

  getFormFromChiller(chiller: ChillerInventoryItem): UntypedFormGroup {
    let form: UntypedFormGroup = this.formBuilder.group({
      name: [chiller.name, Validators.required],
      description: [chiller.description]
    });
    return form;
  }

  getChillerFromForm(form: UntypedFormGroup, chiller: ChillerInventoryItem): ChillerInventoryItem {
    chiller = { 
      ...chiller, 
      name: form.controls.name.value,
      description: form.controls.description.value,
      modifiedDate: new Date() 
    };
    return chiller;
  }
  

  hasValidChillers(processCoolingAssessment: ProcessCoolingAssessment) {
    let hasValidChillers: boolean = false;
    if (processCoolingAssessment.inventory && processCoolingAssessment.inventory.length > 0) {
      hasValidChillers = processCoolingAssessment.inventory.every(chillerInventoryItem => this.isValidChiller(chillerInventoryItem));
    }
    return hasValidChillers;
  }

  
  isValidChiller(chiller: ChillerInventoryItem): boolean {
    let chillerForm: UntypedFormGroup = this.getFormFromChiller(chiller);
    return chillerForm.valid;
  }
}
