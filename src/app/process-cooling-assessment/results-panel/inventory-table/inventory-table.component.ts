import { Component, DestroyRef, inject, WritableSignal } from '@angular/core';
import { combineLatest, Observable } from 'rxjs';
import { ProcessCoolingAssessmentService } from '../../services/process-cooling-asessment.service';
import { ChillerInventoryItem } from '../../../shared/models/process-cooling-assessment';
import { ConfirmDeleteData } from '../../../shared/confirm-delete-modal/confirmDeleteData';
import { Settings } from '../../../shared/models/settings';
import { ChillerInventoryService, InventoryValidState } from '../../services/chiller-inventory.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-inventory-table',
  standalone: false,
  templateUrl: './inventory-table.component.html',
  styleUrl: './inventory-table.component.css'
})
export class InventoryTableComponent {
  private inventoryService: ChillerInventoryService = inject(ChillerInventoryService);
  private processCoolingService: ProcessCoolingAssessmentService = inject(ProcessCoolingAssessmentService);
  private destroyRef = inject(DestroyRef);

  inventoryUIState$: Observable<InventoryState>;
  inventoryValidState: WritableSignal<InventoryValidState> = this.inventoryService.inventoryValidState;

  showConfirmDeleteModal: boolean = false;
  deleteSelectedId: string;
  confirmDeleteData: ConfirmDeleteData;
  settings: Settings;
  
  ngOnInit(): void {
    this.inventoryUIState$ = combineLatest({
      processCooling: this.processCoolingService.processCooling$,
      selectedChiller: this.inventoryService.selectedChiller$,
    }).pipe(
      map(({ processCooling, selectedChiller }) => {
        this.inventoryService.setInventoryValidState(processCooling.inventory);
        return {
          inventory: processCooling.inventory && processCooling.inventory.length > 0 ? processCooling.inventory : [],
          selectedChillerId: selectedChiller?.itemId ?? null,
        };
      }),
      takeUntilDestroyed(this.destroyRef)
    );
  }

  selectItem(item: ChillerInventoryItem) {
    this.inventoryService.setSelectedChiller(item);
  }

  addNewChiller() {
    let newChiller = this.processCoolingService.addNewChillerToAssessment();
    this.inventoryService.setSelectedChiller(newChiller);
  }

  deleteItem() {
    let updatedInventory = this.processCoolingService.deleteChillerFromAssessment(this.deleteSelectedId);
    this.inventoryService.setSelectedChiller(updatedInventory[0]);
  }

// todo global modal component now ready
  openConfirmDeleteModal(item: ChillerInventoryItem) {
    // this.confirmDeleteData = {
    //   modalTitle: 'Delete Chiller Inventory Item',
    //   confirmMessage: `Are you sure you want to delete '${item.name}'?`
    // }
    // this.showConfirmDeleteModal = true;
    // this.deleteSelectedId = item.itemId;
    // this.processCoolingService.modalOpen.next(true);
  }

  onConfirmDeleteClose(deleteInventoryItem: boolean) {
    // if (deleteInventoryItem) {
    //   this.deleteItem();
    // }
    // this.showConfirmDeleteModal = false;
    // this.processCoolingService.modalOpen.next(false);
  }

  createCopy(chiller: ChillerInventoryItem) {
    // let processCoolingAssessment: ProcessCoolingAssessment = this.processCoolingService.processCooling.getValue();
    // let chillerCpy: ChillerInventoryItem = {
    //   ...chiller,
    //   name: chiller.name + ' (copy)',
    //   itemId: getNewIdString(),
    //   modifiedDate: new Date()
    // }
    // processCoolingAssessment.inventory.push(chillerCpy);
    // this.inventoryService.selectedChiller.next(chillerCpy);
    // this.processCoolingService.updateProcessCooling(processCoolingAssessment, true);
  }
}

interface InventoryState {
  inventory: ChillerInventoryItem[];
  selectedChillerId: string | null;
  hasValidChillers?: boolean;
}