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
    let motorInventoryData: MotorInventoryData = this.motorInventoryService.motorInventoryData.getValue();
    this.groups = new Array();
    //nameplate
    let nameplateOptions = this.inventorySummaryTableService.getNameplateDataFields(motorInventoryData.displayOptions.nameplateDataOptions);
    this.groups.push({
      options: nameplateOptions,
      groupLabel: 'Nameplate Data',
      showGroup: true
    });
    //load characteristics
    let loadCharacteristics = this.inventorySummaryTableService.getLoadCharacteristicsFields(motorInventoryData.displayOptions.loadCharactersticOptions);
    this.groups.push({
      options: loadCharacteristics,
      groupLabel: 'Load Characteristics',
      showGroup: false
    });
    //field measurements (operations)
    let fieldMeasurementOptions = this.inventorySummaryTableService.getOperationsDataFields(motorInventoryData.displayOptions.operationDataOptions);
    this.groups.push({
      options: fieldMeasurementOptions,
      groupLabel: 'Field Measurements',
      showGroup: false
    });
    //manual specifications
    let manualSpecificationOptions = this.inventorySummaryTableService.getManualSpecificationsFields(motorInventoryData.displayOptions.manualSpecificationOptions);
    this.groups.push({
      options: manualSpecificationOptions,
      groupLabel: 'Manual Specifications',
      showGroup: false
    });
    //replacement information (batch analysis)
    let replacementInfoOptions = this.inventorySummaryTableService.getBatchAnalysisFields(motorInventoryData.displayOptions.batchAnalysisOptions);
    this.groups.push({
      options: replacementInfoOptions,
      groupLabel: 'Replacement Information',
      showGroup: false
    });
    //purchase information
    let purchaseInformationOptions = this.inventorySummaryTableService.getPurchaseInfoFields(motorInventoryData.displayOptions.purchaseInformationOptions);
    this.groups.push({
      options: purchaseInformationOptions,
      groupLabel: 'Purchase Information',
      showGroup: false
    });
    //torque
    let torqueOptions = this.inventorySummaryTableService.getTorqueDataFields(motorInventoryData.displayOptions.torqueOptions);
    this.groups.push({
      options: torqueOptions,
      groupLabel: 'Torque',
      showGroup: false
    })
    //other
    let otherOptions = this.inventorySummaryTableService.getOtherFields(motorInventoryData.displayOptions.otherOptions);
    this.groups.push({
      options: otherOptions,
      groupLabel: 'Other',
      showGroup: false
    });
  
  }

  ngOnDestroy() {
    this.selectedFieldSub.unsubscribe();
  }

  setSelectedField(option: {display: string, value: string, group: string }){
    this.inventorySummaryGraphService.selectedField.next(option);
  }


  toggleShow(group: any){
    group.showGroup = !group.showGroup;
  }
}
