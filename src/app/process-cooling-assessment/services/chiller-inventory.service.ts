import { inject, Injectable, signal, WritableSignal } from '@angular/core';
import { ChillerInventoryItem, ProcessCoolingAssessment } from '../../shared/models/process-cooling-assessment';
import { FormControl, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { BehaviorSubject, map, Observable } from 'rxjs';
import { getDefaultInventoryItem } from '../process-cooling-constants';

@Injectable({
  providedIn: 'root'
})
export class ChillerInventoryService {
  private formBuilder: UntypedFormBuilder = inject(UntypedFormBuilder);
  private readonly selectedChiller: BehaviorSubject<ChillerInventoryItem> = new BehaviorSubject<ChillerInventoryItem>(undefined);
  selectedChiller$: Observable<ChillerInventoryItem> = this.selectedChiller.asObservable();
  selectedChillerSignal: WritableSignal<ChillerInventoryItem> = signal<ChillerInventoryItem>(undefined);

  inventoryValidState: WritableSignal<InventoryValidState> = signal<InventoryValidState>({
    isValid: false,
    items: {}
  });

  readonly selectedChillerId$ = this.selectedChiller$.pipe(
    map((chiller: ChillerInventoryItem) => chiller ? chiller.itemId : null)
  );

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

  setInventoryValidState(inventory: ChillerInventoryItem[]) {
    let inventoryState: InventoryValidState = {
      isValid: true,
      items: {}
    };

    if (inventory && inventory.length > 0) {
      for (const chiller of inventory) {
        const valid = this.isValidChiller(chiller);
        inventoryState.items[chiller.itemId] = valid;

        if (!valid) {
          inventoryState.isValid = false;
        }
      }
    }
    this.inventoryValidState.set(inventoryState);
  }

  setDefaultChillerName(chiller: ChillerInventoryItem, processCooling: ProcessCoolingAssessment) {
    chiller.name = 'Chiller ' + (processCooling.inventory.indexOf(chiller) + 1).toString();
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

export interface InventoryValidState {
  isValid: boolean;
  items: Record<string, boolean>;
}