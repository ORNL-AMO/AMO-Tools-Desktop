import { inject, Injectable, signal, WritableSignal } from '@angular/core';
import { ChillerInventoryItem, ProcessCoolingAssessment } from '../../shared/models/process-cooling-assessment';
import { FormArray, FormControl, FormGroup, UntypedFormBuilder, Validators } from '@angular/forms';
import { BehaviorSubject, map, Observable } from 'rxjs';

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
    if (inventory && inventory.length > 0) {
      const lastItemModified = this.getLastModifiedInventory(inventory);
      this.setSelectedChiller(lastItemModified);
    } 
  }

  getLastModifiedInventory(inventory: ChillerInventoryItem[]): ChillerInventoryItem {
    return inventory.reduce((prev, current) => {
      return (prev.modifiedDate > current.modifiedDate) ? prev : current;
    });
  }

  getChillerForm(chiller: ChillerInventoryItem): FormGroup<ChillerInventoryForm> {
    const curvePoints: ChillerCurvePoint[] = chiller.loadAtPercent.map((lp, i) => ({ loadPercent: lp, kWPerTon: chiller.kWPerTonAtLoad?.[i] }))
    let form: FormGroup<ChillerInventoryForm> = this.formBuilder.group({
      name: [chiller.name, Validators.required],
      description: [chiller.description],
      isFullLoadEfficiencyKnown: [chiller.isFullLoadEfficiencyKnown],
      chillerType: [chiller.chillerType],
      capacity: [chiller.capacity, Validators.required],
      fullLoadEfficiency: [chiller.fullLoadEfficiency, chiller.isFullLoadEfficiencyKnown ? Validators.required : null],
      age: [chiller.age, Validators.required],
      refrigerantType: [chiller.refrigerantType],
      isCustomChiller: [chiller.isCustomChiller ?? false],
      chillerCurvePoints: this.formBuilder.array(
        curvePoints.map(p => this._buildCurvePointGroup(p.loadPercent, p.kWPerTon, chiller.isCustomChiller))
      ),
    });
    return form;
  }

  patchChillerForm(form: FormGroup<ChillerInventoryForm>, chiller: ChillerInventoryItem) {
    const curvePoints = chiller.loadAtPercent.map((lp, i) => ({ loadPercent: lp, kWPerTon: chiller.kWPerTonAtLoad?.[i] }))
    form.patchValue({
      name: chiller.name,
      description: chiller.description,
      isFullLoadEfficiencyKnown: chiller.isFullLoadEfficiencyKnown,
      chillerType: chiller.chillerType,
      capacity: chiller.capacity,
      fullLoadEfficiency: chiller.fullLoadEfficiency,
      age: chiller.age,
      refrigerantType: chiller.refrigerantType,
      isCustomChiller: chiller.isCustomChiller ?? false,
    }, { emitEvent: false });

    const curvePointsArray = form.controls.chillerCurvePoints;
    curvePoints.forEach((p, i) => {
      curvePointsArray.at(i).patchValue(
        { loadPercent: p.loadPercent, kWPerTon: p.kWPerTon ?? null },
        { emitEvent: false }
      );
    });
    this.updateKwPerTonValidators(form, chiller.isCustomChiller);
  }

  getFullLoadEfficiencyWarning(value: number): string | null {
    if (value === null || value === undefined) {
      return null;
    }
    if (value > 1.5) {
      return 'Full Load Efficiency is usually less than 1.5 kW/ton, calculated efficiency may not be valid';
    }
    if (value < 0.4) {
      return 'Full Load Efficiency must be greater than or equal to 0.4 kW/ton, calculated efficiency may not be valid';
    }
    return null;
  }


  getChillerFields(formValue: Partial<ChillerInventoryItem> & { chillerCurvePoints?: ChillerCurvePoint[] }): Partial<ChillerInventoryItem> {
    const curvePoints = formValue.chillerCurvePoints ?? [];
    const loadAtPercent = curvePoints.map(p => p.loadPercent);
    const kWPerTonAtLoad = curvePoints.map(p => p.kWPerTon);

    return {
      name: formValue.name,
      description: formValue.description,
      isFullLoadEfficiencyKnown: formValue.isFullLoadEfficiencyKnown,
      chillerType: formValue.chillerType,
      capacity: formValue.capacity,
      fullLoadEfficiency: formValue.isFullLoadEfficiencyKnown ? formValue.fullLoadEfficiency : null,
      age: formValue.age,
      refrigerantType: formValue.refrigerantType,
      loadAtPercent: loadAtPercent,
      kWPerTonAtLoad: kWPerTonAtLoad,
      isCustomChiller: formValue.isCustomChiller ?? false,
      modifiedDate: new Date()
    };
  }

  updateKwPerTonValidators(form: FormGroup<ChillerInventoryForm>, isCustomChiller: boolean): void {
    const isRequiredValidator = isCustomChiller ? Validators.required : null;
    form.controls.chillerCurvePoints.controls.forEach(group => {
      const control = group.controls.kWPerTon;
      control.setValidators(isRequiredValidator);
      control.updateValueAndValidity({ emitEvent: false });
    });
  }

  private _buildCurvePointGroup(loadPercent: number, kWPerTon: number, isCustomChiller: boolean): FormGroup<ChillerCurvePointForm> {
    return this.formBuilder.group({
      loadPercent: [loadPercent],
      kWPerTon: [kWPerTon ?? null, isCustomChiller ? Validators.required : null]
    }) as FormGroup<ChillerCurvePointForm>;
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
    let chillerForm: FormGroup<ChillerInventoryForm> = this.getChillerForm(chiller);
    return chillerForm.valid;
  }

}


export interface ChillerCurvePointForm {
  loadPercent: FormControl<number>;
  kWPerTon: FormControl<number>;
}

export interface ChillerInventoryForm {
  name: FormControl<string>;
  description: FormControl<string>;
  isFullLoadEfficiencyKnown: FormControl<boolean>;
  chillerType: FormControl<number>;
  capacity: FormControl<number>;
  fullLoadEfficiency: FormControl<number>;
  age: FormControl<number>;
  refrigerantType: FormControl<number>;
  isCustomChiller: FormControl<boolean>;
  chillerCurvePoints: FormArray<FormGroup<ChillerCurvePointForm>>;
}

export interface InventoryValidState {
  isValid: boolean;
  items: Record<string, boolean>;
}

export interface ChillerCurvePoint {
  loadPercent: number;
  kWPerTon: number;
}