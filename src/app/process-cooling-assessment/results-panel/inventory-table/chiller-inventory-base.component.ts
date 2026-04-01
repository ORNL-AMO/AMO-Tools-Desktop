import { Component, DestroyRef, inject, OnInit, WritableSignal } from '@angular/core';
import { combineLatest, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ChillerInventoryItem } from '../../../shared/models/process-cooling-assessment';
import { ChillerInventoryService, InventoryValidState } from '../../services/chiller-inventory.service';
import { ProcessCoolingAssessmentService } from '../../services/process-cooling-assessment.service';

@Component({
  selector: 'app-chiller-inventory-base',
  template: '',
})
export abstract class ChillerInventoryBaseComponent implements OnInit {
  protected inventoryService: ChillerInventoryService = inject(ChillerInventoryService);
  protected processCoolingService: ProcessCoolingAssessmentService = inject(ProcessCoolingAssessmentService);
  protected destroyRef = inject(DestroyRef);

  inventoryUIState$: Observable<InventoryUIState>;
  inventoryValidState: WritableSignal<InventoryValidState> = this.inventoryService.inventoryValidState;

  ngOnInit(): void {
    this.inventoryUIState$ = combineLatest({
      processCooling: this.processCoolingService.processCooling$,
      selectedChiller: this.inventoryService.selectedChiller$,
    }).pipe(
      map(({ processCooling, selectedChiller }) => {
        this.inventoryService.setInventoryValidState(processCooling.inventory);
        return {
          inventory: processCooling.inventory ?? [],
          selectedChillerId: selectedChiller?.itemId ?? null,
        };
      }),
    );
  }

  selectItem(item: ChillerInventoryItem): void {
    this.inventoryService.setSelectedChiller(item);
  }
}

export interface InventoryUIState {
  inventory: ChillerInventoryItem[];
  selectedChillerId: string | null;
}
