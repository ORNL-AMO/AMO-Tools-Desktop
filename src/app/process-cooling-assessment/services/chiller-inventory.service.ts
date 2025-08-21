import { inject, Injectable, signal, WritableSignal } from '@angular/core';
import { ChillerInventoryItem, ProcessCoolingAssessment } from '../../shared/models/process-cooling-assessment';
import { FormControl, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { BehaviorSubject, Observable } from 'rxjs';
import { getDefaultInventoryItem } from '../process-cooling-constants';

@Injectable({
  providedIn: 'root'
})
export class ChillerInventoryService {
  private formBuilder: UntypedFormBuilder = inject(UntypedFormBuilder);
  private readonly selectedChiller: BehaviorSubject<ChillerInventoryItem> = new BehaviorSubject<ChillerInventoryItem>(undefined);
  selectedChiller$: Observable<ChillerInventoryItem> = this.selectedChiller.asObservable();
  selectedChillerSignal: WritableSignal<ChillerInventoryItem> = signal<ChillerInventoryItem>(undefined);

  get selectedChillerValue() {
    return this.selectedChiller.getValue();
  }
  
  setSelectedChiller(chiller: ChillerInventoryItem) {
    this.selectedChiller.next(chiller);
  } 

  setDefaultSelectedChiller(inventory: ChillerInventoryItem[]) {
    let lastItemModified: ChillerInventoryItem;
    if (inventory && inventory.length > 0) {
      lastItemModified = this.getLastModifiedInventory(inventory);
    } 
    this.setSelectedChiller(lastItemModified);
  }

  getLastModifiedInventory(inventory: ChillerInventoryItem[]): ChillerInventoryItem {
    return inventory.reduce((prev, current) => {
      return (prev.modifiedDate > current.modifiedDate) ? prev : current;
    });
  }

  getChillerForm(chiller: ChillerInventoryItem): UntypedFormGroup {
    let form: UntypedFormGroup = this.formBuilder.group({
      name: [chiller.name, Validators.required],
      description: [chiller.description]
    });
    return form;
  }

  getChiller(formValue: Partial<ChillerInventoryItem>, currentChiller: ChillerInventoryItem): ChillerInventoryItem {
    return {
      ...currentChiller,
      ...formValue,
      modifiedDate: new Date()
    };
  }
  

  hasValidChillers(processCoolingAssessment: ProcessCoolingAssessment) {
    let hasValidChillers: boolean = false;
    if (processCoolingAssessment.inventory && processCoolingAssessment.inventory.length > 0) {
      hasValidChillers = processCoolingAssessment.inventory.every(chillerInventoryItem => this.isValidChiller(chillerInventoryItem));
    }
    return hasValidChillers;
  }


  isValidChiller(chiller: ChillerInventoryItem): boolean {
    let chillerForm: UntypedFormGroup = this.getChillerForm(chiller);
    return chillerForm.valid;
  }

}


export interface ChillerInventoryForm {
  name: FormControl<string>;
  description: FormControl<string>;
}