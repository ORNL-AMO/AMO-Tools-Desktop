import { Component, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ChillerInventoryItem } from '../../../shared/models/process-cooling-assessment';
import { ChillerInventoryBaseComponent } from './chiller-inventory-base.component';
import { ModalDialogService } from '../../../shared/modal-dialog.service';
import { ConfirmActionComponent, ConfirmActionData } from '../../../shared/confirm-action/confirm-action.component';
import { FilterChillerInventoryParams } from '../../pipes/filter-chiller-inventory.pipe';

@Component({
  selector: 'app-inventory-table',
  standalone: false,
  templateUrl: './inventory-table.component.html',
  styleUrl: './chiller-inventory-base.component.css'
})
export class InventoryTableComponent extends ChillerInventoryBaseComponent {
  private modalDialogService: ModalDialogService = inject(ModalDialogService);
  filterInventoryParams: FilterChillerInventoryParams = null;

  override ngOnInit(): void {
    super.ngOnInit();

    this.modalDialogService.closedResult.pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe((deleteId: string) => {
      if (deleteId) {
        this.deleteItem(deleteId);
      }
    });
  }

  addNewChiller() {
    const newChiller = this.processCoolingService.addNewChillerToAssessment();
    this.inventoryService.setSelectedChiller(newChiller);
  }

  deleteItem(itemId: string) {
    const updatedInventory = this.processCoolingService.deleteChillerFromAssessment(itemId);
    this.inventoryService.setSelectedChiller(updatedInventory[0]);
  }

  openConfirmDeleteModal(item: ChillerInventoryItem) {
    this.modalDialogService.openModal<ConfirmActionComponent, ConfirmActionData>(
      ConfirmActionComponent,
      {
        width: '600px',
        data: {
          modalTitle: 'Delete Chiller Inventory Item',
          confirmMessage: `Are you sure you want to delete '${item.name}'?`,
          resourceId: item.itemId,
        },
      },
    );
  }

  createCopy(_chiller: ChillerInventoryItem) {
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
