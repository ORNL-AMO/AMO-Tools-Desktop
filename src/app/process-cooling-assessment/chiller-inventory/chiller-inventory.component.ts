import { ChangeDetectorRef, Component } from '@angular/core';
import { UntypedFormGroup } from '@angular/forms';
import { Subscription } from 'rxjs';
import { ChillerInventoryService } from '../../process-cooling/chiller-inventory/chiller-inventory.service';
import { ChillerInventoryItem, ProcessCoolingAssessment } from '../../shared/models/process-cooling-assessment';
import { ProcessCoolingAssessmentService } from '../services/process-cooling-asessment.service';
import { ProcessCoolingUiService } from '../services/process-cooling-ui.service';

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
  constructor(
    private processCoolingUiService: ProcessCoolingUiService,
    private processCoolingAssessmentService: ProcessCoolingAssessmentService,
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
    // let processCoolingAssessment: ProcessCoolingAssessment = this.processCoolingAssessmentService.processCooling.getValue();
    // todo 7607 eventually process inventory item, do sideffects
    // let result: { newInventoryItem: ChillerInventoryItem, processCoolingAssessment: ProcessCoolingAssessment } = this.inventoryService.AddChillerToAssessment(processCoolingAssessment);
    let newInventoryItem = this.inventoryService.getNewInventoryItem();
    // processCoolingAssessment.inventory.push(newInventoryItem);
    // this.processCoolingAssessmentService.updateProcessCooling(processCoolingAssessment, true);
    this.inventoryService.selectedChiller.next(newInventoryItem);
    this.hasInventoryItems = true;
  }

  save() {
    const updatedChiller: ChillerInventoryItem = this.inventoryService.getChillerFromForm(this.form, this.selectedChiller);
    // let processCoolingAssessment: ProcessCoolingAssessment = this.processCoolingAssessmentService.processCooling.getValue();
    // processCoolingAssessment.inventory = processCoolingAssessment.inventory.map(item => {
    //   if (item.itemId === updatedChiller.itemId) {
    //     return { ...updatedChiller, modifiedDate: new Date() };
    //   }
    //   return item;
    // });
    // this.processCoolingAssessmentService.updateProcessCooling(processCoolingAssessment, true);
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
    this.processCoolingUiService.focusedFieldSignal.set(str);
  }
}
