import { Component, DestroyRef, inject, WritableSignal } from '@angular/core';
import { combineLatest, Observable } from 'rxjs';
import { ProcessCoolingAssessmentService } from '../../services/process-cooling-asessment.service';
import { ChillerInventoryItem } from '../../../shared/models/process-cooling-assessment';
import { Settings } from '../../../shared/models/settings';
import { ChillerInventoryService, InventoryValidState } from '../../services/chiller-inventory.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { map } from 'rxjs/operators';
import { ModalDialogService } from '../../../shared/modal-dialog.service';
import { ConfirmDeleteComponent, ConfirmDeleteData } from '../../confirm-delete/confirm-delete.component';

@Component({
  selector: 'app-inventory-table',
  standalone: false,
  templateUrl: './inventory-table.component.html',
  styleUrl: './inventory-table.component.css'
})
export class InventoryTableComponent {
  private inventoryService: ChillerInventoryService = inject(ChillerInventoryService);
  private processCoolingService: ProcessCoolingAssessmentService = inject(ProcessCoolingAssessmentService);
  private modalDialogService: ModalDialogService = inject(ModalDialogService);
  private destroyRef = inject(DestroyRef);

  inventoryUIState$: Observable<InventoryState>;
  inventoryValidState: WritableSignal<InventoryValidState> = this.inventoryService.inventoryValidState;
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
    );

    this.modalDialogService.closedResult.pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe((deleteId: string) => {
      if (deleteId) {
        this.deleteItem(deleteId);
      }
    });


  }

  selectItem(item: ChillerInventoryItem) {
    this.inventoryService.setSelectedChiller(item);
  }

  addNewChiller() {
    let newChiller = this.processCoolingService.addNewChillerToAssessment();
    this.inventoryService.setSelectedChiller(newChiller);
  }

  deleteItem(itemId: string) {
    let updatedInventory = this.processCoolingService.deleteChillerFromAssessment(itemId);
    this.inventoryService.setSelectedChiller(updatedInventory[0]);
  }

  openConfirmDeleteModal(item: ChillerInventoryItem) {
    this.modalDialogService.openModal<ConfirmDeleteComponent, ConfirmDeleteData>(
      ConfirmDeleteComponent,
      {
        width: '600px',
        data: {
          modalTitle: 'Delete Chiller Inventory Item',
          confirmMessage: `Are you sure you want to delete '${item.name}'?`,
          deleteId: item.itemId,
        },
      },
    );

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