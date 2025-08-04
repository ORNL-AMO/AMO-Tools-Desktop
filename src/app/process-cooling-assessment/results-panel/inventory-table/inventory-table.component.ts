import { Component } from '@angular/core';
import { Subscription } from 'rxjs';
import { ChillerInventoryService } from '../../chiller-inventory/chiller-inventory.service';
import { ProcessCoolingAssessmentService } from '../../services/process-cooling-asessment.service';
import { ChillerInventoryItem } from '../../../shared/models/process-cooling-assessment';
import { ConfirmDeleteData } from '../../../shared/confirm-delete-modal/confirmDeleteData';
import { Settings } from '../../../shared/models/settings';

@Component({
  selector: 'app-inventory-table',
  standalone: false,
  templateUrl: './inventory-table.component.html',
  styleUrl: './inventory-table.component.css'
})
export class InventoryTableComponent {

  processCoolingAssessmentSub: Subscription;
  chillerInventoryItems: Array<ChillerInventoryItem>;

  selectedChiller: ChillerInventoryItem;
  selectedChillerSub: Subscription;

  showConfirmDeleteModal: boolean = false;
  deleteSelectedId: string;
  hasInvalidChillers: boolean = false;
  confirmDeleteData: ConfirmDeleteData;
  settings: Settings;

  constructor(private inventoryService: ChillerInventoryService, private processCoolingService: ProcessCoolingAssessmentService) { }

  ngOnInit(): void {
    this.settings = this.processCoolingService.settingsValue;
    // this.selectedChillerSub = this.inventoryService.selectedChiller.subscribe(val => {
    //   this.selectedChiller = val;
    // })
    // this.processCoolingAssessmentSub = this.processCoolingService.processCooling.subscribe(val => {
    //   if (val) {
    //     this.chillerInventoryItems = val.inventory;
    //     this.chillerInventoryItems.forEach(chiller => {
    //       chiller.isValid = this.inventoryService.isValidChiller(chiller);
    //       if (!chiller.name) {
    //         chiller.name = 'Chiller ' + (this.chillerInventoryItems.indexOf(chiller) + 1).toString();
    //         chiller.isValid = this.inventoryService.isValidChiller(chiller);
    //       }
    //     });
    //     this.hasInvalidChillers = this.chillerInventoryItems.some(chiller => !chiller.isValid);
    //   }
    // });
  }

  // ngOnDestroy() {
  //   this.selectedChillerSub.unsubscribe();
  //   this.processCoolingAssessmentSub.unsubscribe();
  // }

  selectItem(item: ChillerInventoryItem) {
    this.inventoryService.selectedChiller.next(item);
  }

  addNewChiller() {
    // let processCoolingAssessment: ProcessCoolingAssessment = this.processCoolingService.processCooling.getValue();
    // let newInventoryItem = this.inventoryService.getNewInventoryItem();
    // processCoolingAssessment.inventory.push(newInventoryItem);
    // this.processCoolingService.updateProcessCooling(processCoolingAssessment, true);
    // this.inventoryService.selectedChiller.next(newInventoryItem);
  }

  deleteItem() {
    // let processCoolingAssessment: ProcessCoolingAssessment = this.processCoolingService.processCooling.getValue();
    // let itemIndex: number = processCoolingAssessment.inventory.findIndex(inventoryItem => { return inventoryItem.itemId == this.deleteSelectedId });
    // if (itemIndex !== -1) {
    //   processCoolingAssessment.inventory.splice(itemIndex, 1);
    //   this.processCoolingService.updateProcessCooling(processCoolingAssessment, true);
    //   this.inventoryService.selectedChiller.next(processCoolingAssessment.inventory[0]);
    // }
  }

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