import { ChangeDetectorRef, Component } from '@angular/core';
import { UntypedFormGroup } from '@angular/forms';
import _ from 'lodash';
import { Subscription } from 'rxjs';
import { ProcessCoolingService } from '../process-cooling.service';
import { ChillerInventoryService } from './chiller-inventory.service';
import { ChillerInventoryItem, ProcessCoolingAssessment } from '../../shared/models/process-cooling-assessment';

@Component({
  selector: 'app-chiller-inventory',
  standalone: false,
  templateUrl: './chiller-inventory.component.html',
  styleUrl: './chiller-inventory.component.css'
})
export class ChillerInventoryComponent {

  hasInventoryItems: boolean;
  form: UntypedFormGroup;
  selectedChillerSub: Subscription;
  showChillerModal: boolean = false;
  hasValidChillers: boolean = true;
  selectedChiller: ChillerInventoryItem;
  constructor(private processCoolingService: ProcessCoolingService,
    private inventoryService: ChillerInventoryService, private cd: ChangeDetectorRef,
    // private compressedAirDataManagementService: CompressedAirDataManagementService
  ) { }

  ngOnInit(): void {
    // todo 7607 or initialize from parent
    this.initializeInventory();
    this.selectedChillerSub = this.inventoryService.selectedChiller.subscribe(val => {
        this.selectedChiller = val;
        if (val) {
          this.form = this.inventoryService.getFormFromChiller(val);
          this.hasInventoryItems = true;
        } else {
          this.hasInventoryItems = false;
        }
        // this.hasValidChillers = this.inventoryService.hasValidChillers(processCoolingAssessment);
    });
  }

  ngOnDestroy() {
    this.selectedChillerSub.unsubscribe();
  }

  // todo 7607 may not be needed
  initializeInventory() {
    // let processCoolingAssessment: ProcessCoolingAssessment = this.processCoolingService.processCooling.getValue();
    // this.hasInventoryItems = (processCoolingAssessment.inventory.length != 0);
    // if (this.hasInventoryItems) {
    //   this.hasValidChillers = this.inventoryService.hasValidChillers(processCoolingAssessment);
    //   let selectedChiller: ChillerInventoryItem = this.inventoryService.selectedChiller.getValue();
    //   if (selectedChiller) {
    //     let chillerExist: ChillerInventoryItem = processCoolingAssessment.inventory.find(item => { return item.itemId == selectedChiller.itemId });
    //     if (!chillerExist) {
    //       let lastItemModified: ChillerInventoryItem = _.maxBy(processCoolingAssessment.inventory, 'modifiedDate');
    //       this.inventoryService.selectedChiller.next(lastItemModified);
    //     }
    //   } else {
    //     let lastItemModified: ChillerInventoryItem = _.maxBy(processCoolingAssessment.inventory, 'modifiedDate');
    //     this.inventoryService.selectedChiller.next(lastItemModified);
    //   }
    // }
  }

  addInventoryItem() {
    let processCoolingAssessment: ProcessCoolingAssessment = this.processCoolingService.processCooling.getValue();
    // todo 7607 eventually process inventory item, do sideffects
    // let result: { newInventoryItem: ChillerInventoryItem, processCoolingAssessment: ProcessCoolingAssessment } = this.inventoryService.AddChillerToAssessment(processCoolingAssessment);
    let newInventoryItem = this.inventoryService.getNewInventoryItem();
    processCoolingAssessment.inventory.push(newInventoryItem);
    this.processCoolingService.updateProcessCooling(processCoolingAssessment, true);
    this.inventoryService.selectedChiller.next(newInventoryItem);
    this.hasInventoryItems = true;
  }

  save() {
    const updatedChiller: ChillerInventoryItem = this.inventoryService.getChillerFromForm(this.form, this.selectedChiller);
    let processCoolingAssessment: ProcessCoolingAssessment = this.processCoolingService.processCooling.getValue();
    processCoolingAssessment.inventory = processCoolingAssessment.inventory.map(item => {
      if (item.itemId === updatedChiller.itemId) {
        return { ...updatedChiller, modifiedDate: new Date() };
      }
      return item;
    });
    this.processCoolingService.updateProcessCooling(processCoolingAssessment, true);
  }

  openChillerModal() {
    this.showChillerModal = true;
    this.cd.detectChanges();
  }

  closeChillerModal() {
    this.showChillerModal = false;
    this.cd.detectChanges();
  }

  focusField(str: string) {
    this.processCoolingService.focusedField.next(str);
  }
}
