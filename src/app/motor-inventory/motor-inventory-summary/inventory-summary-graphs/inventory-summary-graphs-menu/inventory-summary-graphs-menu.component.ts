import { Component, OnInit } from '@angular/core';
import { MotorInventoryService } from '../../../motor-inventory.service';
import { InventorySummaryGraphsService } from '../inventory-summary-graphs.service';
import { Subscription } from 'rxjs';
import { InventorySummaryTableService } from '../../inventory-summary-table/inventory-summary-table.service';
import { MotorInventoryData } from '../../../motor-inventory';

@Component({
  selector: 'app-inventory-summary-graphs-menu',
  templateUrl: './inventory-summary-graphs-menu.component.html',
  styleUrls: ['./inventory-summary-graphs-menu.component.css']
})
export class InventorySummaryGraphsMenuComponent implements OnInit {

  nameplateOptions: Array<{ display: string, value: string, group: string }>;
  showNameplateOptions: boolean = true;
  batchAnalysisOptions: Array<any>;
  showBatchAnalysisOptions: boolean = true;
  loadCharacteristicOptions: Array<any>;
  showLoadCharacteristicOptions: boolean = true;
  manualSpecificationOptions: Array<any>;
  showManualSpecificationOptions: boolean = true;
  operationOptions: Array<any>;
  showOperationOptions: boolean = true;
  otherOptions: Array<any>;
  showOtherOptions: boolean = true;
  purchaseInformationOptions: Array<any>;
  showPurchaseInformationOptions: boolean = true;
  torqueOptions: Array<any>;
  showTorqueOptions: boolean = true;
  selectedFieldSub: Subscription;
  selectedField: { display: string, value: string, group: string };
  constructor(private motorInventoryService: MotorInventoryService, private inventorySummaryGraphService: InventorySummaryGraphsService,
    private inventorySummaryTableService: InventorySummaryTableService) { }

  ngOnInit(): void {
    this.selectedFieldSub = this.inventorySummaryGraphService.selectedField.subscribe(val => {
      this.selectedField = val;
    });
    let motorInventoryData: MotorInventoryData = this.motorInventoryService.motorInventoryData.getValue();
    this.nameplateOptions = this.inventorySummaryTableService.getNameplateDataFields(motorInventoryData.displayOptions.nameplateDataOptions);
  }

  ngOnDestroy() {
    this.selectedFieldSub.unsubscribe();
  }

  setSelectedField(option: {display: string, value: string, group: string }){
    this.inventorySummaryGraphService.selectedField.next(option);
  }

}
