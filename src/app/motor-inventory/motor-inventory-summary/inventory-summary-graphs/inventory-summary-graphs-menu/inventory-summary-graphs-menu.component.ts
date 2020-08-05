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

  selectedFieldSub: Subscription;
  selectedField: { display: string, value: string, group: string };

  groups: Array<{
    options: Array<{ display: string, value: string, group: string }>,
    groupLabel: string,
    showGroup: boolean
  }>
  constructor(private motorInventoryService: MotorInventoryService, private inventorySummaryGraphService: InventorySummaryGraphsService,
    private inventorySummaryTableService: InventorySummaryTableService) { }

  ngOnInit(): void {
    this.selectedFieldSub = this.inventorySummaryGraphService.selectedField.subscribe(val => {
      this.selectedField = val;
    });
    this.setOptions();
  }

  ngOnDestroy() {
    this.selectedFieldSub.unsubscribe();
  }

  setOptions(){
    this.groups = new Array();
    let motorInventoryData: MotorInventoryData = this.motorInventoryService.motorInventoryData.getValue();
    //nameplate
    this.groups.push({
      options: this.inventorySummaryTableService.getNameplateDataFields(motorInventoryData.displayOptions.nameplateDataOptions),
      groupLabel: 'Nameplate Data',
      showGroup: true
    });
    //load characteristics
    this.groups.push({
      options:  this.inventorySummaryTableService.getLoadCharacteristicsFields(motorInventoryData.displayOptions.loadCharactersticOptions),
      groupLabel: 'Load Characteristics',
      showGroup: false
    });
    //field measurements (operations)
    this.groups.push({
      options: this.inventorySummaryTableService.getOperationsDataFields(motorInventoryData.displayOptions.operationDataOptions),
      groupLabel: 'Field Measurements',
      showGroup: false
    });
    //manual specifications
    this.groups.push({
      options: this.inventorySummaryTableService.getManualSpecificationsFields(motorInventoryData.displayOptions.manualSpecificationOptions),
      groupLabel: 'Manual Specifications',
      showGroup: false
    });
    //replacement information (batch analysis)
    this.groups.push({
      options: this.inventorySummaryTableService.getBatchAnalysisFields(motorInventoryData.displayOptions.batchAnalysisOptions),
      groupLabel: 'Replacement Information',
      showGroup: false
    });
    //purchase information
    this.groups.push({
      options:  this.inventorySummaryTableService.getPurchaseInfoFields(motorInventoryData.displayOptions.purchaseInformationOptions),
      groupLabel: 'Purchase Information',
      showGroup: false
    });
    //torque
    this.groups.push({
      options: this.inventorySummaryTableService.getTorqueDataFields(motorInventoryData.displayOptions.torqueOptions),
      groupLabel: 'Torque',
      showGroup: false
    })
    //other
    this.groups.push({
      options: this.inventorySummaryTableService.getOtherFields(motorInventoryData.displayOptions.otherOptions),
      groupLabel: 'Other',
      showGroup: false
    });

  }

  setSelectedField(option: {display: string, value: string, group: string }){
    this.inventorySummaryGraphService.selectedField.next(option);
  }


  toggleShow(group: any){
    group.showGroup = !group.showGroup;
  }
}
