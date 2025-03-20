import { Component } from '@angular/core';
import { Settings } from '../../../../shared/models/settings';
import { PumpInventoryData } from '../../../pump-inventory';
import { PumpInventoryService } from '../../../pump-inventory.service';
import { PumpSummaryGraphsService } from '../pump-summary-graphs.service';
import { PumpInventorySummaryService } from '../../pump-inventory-summary.service';
import { Subscription } from 'rxjs';
import * as _ from 'lodash';

@Component({
    selector: 'app-pump-summary-graphs-menu',
    templateUrl: './pump-summary-graphs-menu.component.html',
    styleUrls: ['./pump-summary-graphs-menu.component.css'],
    standalone: false
})
export class PumpSummaryGraphsMenuComponent {

  selectedFieldSub: Subscription;
  selectedField: { display: string, value: string, group: string };
  graphTypeSub: Subscription;
  graphType: string;
  groups: Array<{
    options: Array<{ display: string, value: string, group: string }>,
    groupLabel: string,
    showGroup: boolean
  }>
  constructor(private pumpInventoryService: PumpInventoryService, private pumpSummaryGraphsService: PumpSummaryGraphsService, private pumpInventorySummaryService: PumpInventorySummaryService) { }

  ngOnInit(): void {
    this.setOptions();
    this.selectedFieldSub = this.pumpSummaryGraphsService.selectedField.subscribe(val => {
      if (val) {
        this.selectedField = val;
      } else {
        // todo 6232 use named default if we end up having required fields to display
        let defaultOption = this.groups[0].options[0];
        this.setSelectedField(defaultOption);
      }
    });
    this.graphTypeSub = this.pumpSummaryGraphsService.graphType.subscribe(val => {
      this.graphType = val;
    })
  }

  ngOnDestroy() {
    this.selectedFieldSub.unsubscribe();
    this.graphTypeSub.unsubscribe();
  }

  setOptions() {
    this.groups = new Array();
    let settings: Settings = this.pumpInventoryService.settings.getValue();
    let pumpInventoryData: PumpInventoryData = this.pumpInventoryService.pumpInventoryData.getValue();
    this.groups.push({
      options: this.pumpInventorySummaryService.getNameplateDataFields(pumpInventoryData.displayOptions.nameplateDataOptions, settings),
      groupLabel: 'Nameplate Data',
      showGroup: true
    });
    this.groups.push({
      options: this.pumpInventorySummaryService.getPumpPropertiesFields(pumpInventoryData.displayOptions.pumpPropertiesOptions, settings),
      groupLabel: 'Pump',
      showGroup: false
    });
    this.groups.push({
      options: this.pumpInventorySummaryService.getFluidPropertiesFields(pumpInventoryData.displayOptions.fluidPropertiesOptions, settings),
      groupLabel: 'Fluid',
      showGroup: false
    });
    this.groups.push({
      options: this.pumpInventorySummaryService.getFieldMeasurementsFields(pumpInventoryData.displayOptions.fieldMeasurementOptions, settings),
      groupLabel: 'Field Measurements',
      showGroup: false
    });
    this.groups.push({
      options: this.pumpInventorySummaryService.getPumpMotorFields(pumpInventoryData.displayOptions.pumpMotorPropertiesOptions, settings),
      groupLabel: 'Motor',
      showGroup: false
    });
    this.groups.push({
      options: this.pumpInventorySummaryService.getPumpStatusFields(pumpInventoryData.displayOptions.pumpStatusOptions, settings),
      groupLabel: 'Status',
      showGroup: false
    });
    this.groups.push({
      options: this.pumpInventorySummaryService.getSystemPropertiesFields(pumpInventoryData.displayOptions.systemPropertiesOptions, settings),
      groupLabel: 'System',
      showGroup: false
    });

  }

  setSelectedField(option: { display: string, value: string, group: string }) {
    this.pumpSummaryGraphsService.selectedField.next(option);
  }


  toggleShow(group: any) {
    group.showGroup = !group.showGroup;
  }

  setGraphType(str: string) {
    this.pumpSummaryGraphsService.graphType.next(str);
    this.pumpSummaryGraphsService.selectedField.next(this.selectedField);
  }
}
