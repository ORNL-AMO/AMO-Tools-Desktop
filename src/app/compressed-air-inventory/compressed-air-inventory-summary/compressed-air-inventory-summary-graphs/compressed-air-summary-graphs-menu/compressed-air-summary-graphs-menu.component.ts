import { Component } from '@angular/core';
import { CompressedAirInventoryService } from '../../../compressed-air-inventory.service';
import { CompressedAirInventorySummaryGraphsService } from '../compressed-air-inventory-summary-graphs.service';
import { Subscription } from 'rxjs';
import { Settings } from '../../../../shared/models/settings';
import { CompressedAirInventoryData } from '../../../compressed-air-inventory';
import { CompressedAirInventorySummaryService } from '../../compressed-air-inventory-summary.service';

@Component({
  selector: 'app-compressed-air-summary-graphs-menu',
  templateUrl: './compressed-air-summary-graphs-menu.component.html',
  styleUrl: './compressed-air-summary-graphs-menu.component.css',
  standalone: false
})
export class CompressedAirSummaryGraphsMenuComponent {

  selectedFieldSub: Subscription;
  selectedField: { display: string, value: string, group: string };
  graphTypeSub: Subscription;
  graphType: string;
  groups: Array<{
    options: Array<{ display: string, value: string, group: string }>,
    groupLabel: string,
    showGroup: boolean
  }>
  constructor(private compressedAirInventoryService: CompressedAirInventoryService, private compressedAirInventorySummaryGraphsService: CompressedAirInventorySummaryGraphsService, private compressedAirInventorySummaryService: CompressedAirInventorySummaryService) { }

  ngOnInit(): void {
    this.setOptions();
    this.selectedFieldSub = this.compressedAirInventorySummaryGraphsService.selectedField.subscribe(val => {
      if (val) {
        this.selectedField = val;
      } else {
        let defaultOption = this.groups[0].options[0];
        this.setSelectedField(defaultOption);
      }
    });
    this.graphTypeSub = this.compressedAirInventorySummaryGraphsService.graphType.subscribe(val => {
      this.graphType = val;
    })
  }

  ngOnDestroy() {
    this.selectedFieldSub.unsubscribe();
    this.graphTypeSub.unsubscribe();
  }

  setOptions() {
    this.groups = new Array();
    let settings: Settings = this.compressedAirInventoryService.settings.getValue();
    let compressedAirInventoryData: CompressedAirInventoryData = this.compressedAirInventoryService.compressedAirInventoryData.getValue();
    this.groups.push({
      options: this.compressedAirInventorySummaryService.getNameplateDataFields(compressedAirInventoryData.displayOptions.nameplateDataOptions, settings),
      groupLabel: 'Nameplate Data',
      showGroup: true
    });
    this.groups.push({
      options: this.compressedAirInventorySummaryService.getFieldMeasurementsFields(compressedAirInventoryData.displayOptions.fieldMeasurementsOptions, settings),
      groupLabel: 'Field Measurements',
      showGroup: false
    });
    this.groups.push({
      options: this.compressedAirInventorySummaryService.getMotorFields(compressedAirInventoryData.displayOptions.compressedAirMotorPropertiesOptions, settings),
      groupLabel: 'Motor',
      showGroup: false
    });
    this.groups.push({
      options: this.compressedAirInventorySummaryService.getControlsPropertiesFields(compressedAirInventoryData.displayOptions.compressedAirControlsPropertiesOptions, settings),
      groupLabel: 'Controls',
      showGroup: false
    });
    this.groups.push({
      options: this.compressedAirInventorySummaryService.getDesignDetailsFields(compressedAirInventoryData.displayOptions.compressedAirDesignDetailsPropertiesOptions, settings),
      groupLabel: 'Design Details',
      showGroup: false
    });

  }

  setSelectedField(option: { display: string, value: string, group: string }) {
    this.compressedAirInventorySummaryGraphsService.selectedField.next(option);
  }


  toggleShow(group: any) {
    group.showGroup = !group.showGroup;
  }

  setGraphType(str: string) {
    this.compressedAirInventorySummaryGraphsService.graphType.next(str);
    this.compressedAirInventorySummaryGraphsService.selectedField.next(this.selectedField);
  }
}