import { Component, OnInit } from '@angular/core';
import { MotorInventoryService } from '../../../motor-inventory.service';
import { InventorySummaryGraphsService } from '../inventory-summary-graphs.service';
import { Subscription } from 'rxjs';
import { MotorInventoryData } from '../../../motor-inventory';
import { Settings } from '../../../../shared/models/settings';
import * as _ from 'lodash';
import { MotorInventorySummaryService } from '../../motor-inventory-summary.service';
@Component({
  selector: 'app-inventory-summary-graphs-menu',
  templateUrl: './inventory-summary-graphs-menu.component.html',
  styleUrls: ['./inventory-summary-graphs-menu.component.css']
})
export class InventorySummaryGraphsMenuComponent implements OnInit {

  selectedFieldSub: Subscription;
  selectedField: { display: string, value: string, group: string };
  graphTypeSub: Subscription;
  graphType: string;
  groups: Array<{
    options: Array<{ display: string, value: string, group: string }>,
    groupLabel: string,
    showGroup: boolean
  }>
  constructor(private motorInventoryService: MotorInventoryService, private inventorySummaryGraphService: InventorySummaryGraphsService, private motorInventorySummaryService: MotorInventorySummaryService) { }

  ngOnInit(): void {
    this.setOptions();
    this.selectedFieldSub = this.inventorySummaryGraphService.selectedField.subscribe(val => {
      if (val) {
        this.selectedField = val;
      } else {
        let ratedPowerOption = _.find(this.groups[0].options, (option) => { return option.value == 'ratedMotorPower' });
        this.setSelectedField(ratedPowerOption);
      }
    });
    this.graphTypeSub = this.inventorySummaryGraphService.graphType.subscribe(val => {
      this.graphType = val;
    })
  }

  ngOnDestroy() {
    this.selectedFieldSub.unsubscribe();
    this.graphTypeSub.unsubscribe();
  }

  setOptions() {
    this.groups = new Array();
    let settings: Settings = this.motorInventoryService.settings.getValue();
    let motorInventoryData: MotorInventoryData = this.motorInventoryService.motorInventoryData.getValue();
    //nameplate
    this.groups.push({
      options: this.motorInventorySummaryService.getNameplateDataFields(motorInventoryData.displayOptions.nameplateDataOptions, settings),
      groupLabel: 'Nameplate Data',
      showGroup: true
    });
    //load characteristics
    this.groups.push({
      options: this.motorInventorySummaryService.getLoadCharacteristicsFields(motorInventoryData.displayOptions.loadCharactersticOptions),
      groupLabel: 'Load Characteristics',
      showGroup: false
    });
    //field measurements (operations)
    this.groups.push({
      options: this.motorInventorySummaryService.getOperationsDataFields(motorInventoryData.displayOptions.operationDataOptions),
      groupLabel: 'Field Measurements',
      showGroup: false
    });
    //manual specifications
    this.groups.push({
      options: this.motorInventorySummaryService.getManualSpecificationsFields(motorInventoryData.displayOptions.manualSpecificationOptions),
      groupLabel: 'Manual Specifications',
      showGroup: false
    });
    //replacement information (batch analysis)
    this.groups.push({
      options: this.motorInventorySummaryService.getBatchAnalysisFields(motorInventoryData.displayOptions.batchAnalysisOptions, settings),
      groupLabel: 'Replacement Information',
      showGroup: false
    });
    //purchase information
    this.groups.push({
      options: this.motorInventorySummaryService.getPurchaseInfoFields(motorInventoryData.displayOptions.purchaseInformationOptions),
      groupLabel: 'Purchase Information',
      showGroup: false
    });
    //torque
    this.groups.push({
      options: this.motorInventorySummaryService.getTorqueDataFields(motorInventoryData.displayOptions.torqueOptions, settings),
      groupLabel: 'Torque',
      showGroup: false
    })
    //other
    this.groups.push({
      options: this.motorInventorySummaryService.getOtherFields(motorInventoryData.displayOptions.otherOptions),
      groupLabel: 'Other',
      showGroup: false
    });
    
  }

  setSelectedField(option: { display: string, value: string, group: string }) {
    this.inventorySummaryGraphService.selectedField.next(option);
  }


  toggleShow(group: any) {
    group.showGroup = !group.showGroup;
  }

  setGraphType(str: string) {
    this.inventorySummaryGraphService.graphType.next(str);
    this.inventorySummaryGraphService.selectedField.next(this.selectedField);
  }
}
