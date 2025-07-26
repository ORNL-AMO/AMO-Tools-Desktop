import { Component, signal, WritableSignal } from '@angular/core';
import { ConfirmDeleteData } from '../../../shared/confirm-delete-modal/confirmDeleteData';
import { Settings } from '../../../shared/models/settings';
import { ChillerInventoryService } from '../../chiller-inventory/chiller-inventory.service';
import { ChillerInventoryItem, ProcessCoolingAssessment } from '../../../shared/models/process-cooling-assessment';
import { Subscription } from 'rxjs';
import { copyObject, getNewIdString } from '../../../shared/helperFunctions';
import { ProcessCoolingAssessmentService } from '../../process-cooling-assessment.service';
import { ProcessCoolingUiService } from '../../process-cooling-ui.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-inventory-table',
  standalone: false,
  templateUrl: './inventory-table.component.html',
  styleUrl: './inventory-table.component.css'
})
export class InventoryTableComponent {

  chillerInventoryItems: Array<ChillerInventoryItem>;

  selectedChiller: ChillerInventoryItem;

  showConfirmDeleteModal: boolean = false;
  deleteSelectedId: string;
  hasInvalidChillers: boolean = false;
  confirmDeleteData: ConfirmDeleteData;
  settings: Settings;

  modalOpen: WritableSignal<boolean> = signal<boolean>(false);

  constructor(private inventoryService: ChillerInventoryService,
    private processCoolingUiService: ProcessCoolingUiService,
    private processCoolingAssessmentService: ProcessCoolingAssessmentService) {
      
    this.inventoryService.selectedChiller
      .pipe(takeUntilDestroyed())
      .subscribe(val => {
        this.selectedChiller = val;
      });

    this.processCoolingAssessmentService.processCooling
      .pipe(takeUntilDestroyed())
      .subscribe(val => {
        if (val) {
          this.chillerInventoryItems = val.inventory;
          this.chillerInventoryItems.forEach(chiller => {
            chiller.isValid = this.inventoryService.isValidChiller(chiller);
            if (!chiller.name) {
              chiller.name = 'Chiller ' + (this.chillerInventoryItems.indexOf(chiller) + 1).toString();
              chiller.isValid = this.inventoryService.isValidChiller(chiller);
            }
          });
          this.hasInvalidChillers = this.chillerInventoryItems.some(chiller => !chiller.isValid);
        }
      });
  }

  ngOnInit(): void {
    this.modalOpen = this.processCoolingUiService.modalOpenSignal;
    this.settings = this.processCoolingAssessmentService.settings.getValue();
  }

  selectItem(item: ChillerInventoryItem) {
    this.inventoryService.selectedChiller.next(item);
  }

  addNewChiller() {
    let processCoolingAssessment: ProcessCoolingAssessment = this.processCoolingAssessmentService.processCooling.getValue();
    let newInventoryItem = this.inventoryService.getNewInventoryItem();
    processCoolingAssessment.inventory.push(newInventoryItem);
    this.processCoolingAssessmentService.updateProcessCooling(processCoolingAssessment, true);
    this.inventoryService.selectedChiller.next(newInventoryItem);
  }

  deleteItem() {
    let processCoolingAssessment: ProcessCoolingAssessment = this.processCoolingAssessmentService.processCooling.getValue();
    let itemIndex: number = processCoolingAssessment.inventory.findIndex(inventoryItem => { return inventoryItem.itemId == this.deleteSelectedId });
    if (itemIndex !== -1) {
      processCoolingAssessment.inventory.splice(itemIndex, 1);
      this.processCoolingAssessmentService.updateProcessCooling(processCoolingAssessment, true);
      this.inventoryService.selectedChiller.next(processCoolingAssessment.inventory[0]);
    }
  }

  openConfirmDeleteModal(item: ChillerInventoryItem) {
    this.confirmDeleteData = {
      modalTitle: 'Delete Chiller Inventory Item',
      confirmMessage: `Are you sure you want to delete '${item.name}'?`
    }
    this.showConfirmDeleteModal = true;
    this.deleteSelectedId = item.itemId;
    this.modalOpen.set(true);
  }

  onConfirmDeleteClose(deleteInventoryItem: boolean) {
    if (deleteInventoryItem) {
      this.deleteItem();
    }
    this.showConfirmDeleteModal = false;
    this.modalOpen.set(false);
  }

  createCopy(chiller: ChillerInventoryItem) {
    let processCoolingAssessment: ProcessCoolingAssessment = this.processCoolingAssessmentService.processCooling.getValue();
    let chillerCpy: ChillerInventoryItem = {
      ...chiller,
      name: chiller.name + ' (copy)',
      itemId: getNewIdString(),
      modifiedDate: new Date()
    }
    processCoolingAssessment.inventory.push(chillerCpy);
    this.inventoryService.selectedChiller.next(chillerCpy);
    this.processCoolingAssessmentService.updateProcessCooling(processCoolingAssessment, true);
  }
}
