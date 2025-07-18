import { Component } from '@angular/core';
import { Settings } from '../../../../shared/models/settings';
import { Subscription } from 'rxjs';
import { CompressedAirInventoryService, FilterInventorySummary } from '../../../compressed-air-inventory.service';
import { CompressedAirInventoryData, CompressedAirItem, ControlTypes } from '../../../compressed-air-inventory';
import _ from 'lodash';
import { CompressedAirInventorySummaryService } from '../../../compressed-air-inventory-summary/compressed-air-inventory-summary.service';
import { CompressedAirInventorySummaryGraphsService } from '../../../compressed-air-inventory-summary/compressed-air-inventory-summary-graphs/compressed-air-inventory-summary-graphs.service';

@Component({
  selector: 'app-control-type-dropdown',
  templateUrl: './control-type-dropdown.component.html',
  styleUrl: './control-type-dropdown.component.css',
  standalone: false
})
export class ControlTypeDropdownComponent {
  settings: Settings;
  controlTypes: Array<{ value: number, count: number, label: string }>;
  filterInventorySummarySub: Subscription;
  filterInventorySummary: FilterInventorySummary;
  showDropdown: boolean;
  controlTypesOptions: Array<{ value: number, label: string }> = ControlTypes;

  constructor(private compressedAirInventoryService: CompressedAirInventoryService, private compressedAirInventorySummaryService: CompressedAirInventorySummaryService, private compressedAirInventorySummaryGraphsService: CompressedAirInventorySummaryGraphsService) { }

  ngOnInit(): void {
    this.settings = this.compressedAirInventoryService.settings.getValue();
    this.filterInventorySummarySub = this.compressedAirInventoryService.filterInventorySummary.subscribe(val => {
      this.filterInventorySummary = val;
      this.setOptions();
    });
  }
  ngOnDestroy() {
    this.filterInventorySummarySub.unsubscribe();
  }
  setOptions() {
    this.controlTypes = new Array();
    let compressedAirInventoryData: CompressedAirInventoryData = this.compressedAirInventoryService.compressedAirInventoryData.value;
    let allCompressors: Array<CompressedAirItem> = this.compressedAirInventorySummaryService.getAllCompressors(compressedAirInventoryData);
    let options = _.countBy(allCompressors, (compressor: CompressedAirItem) => { return compressor.compressedAirControlsProperties.controlType });
    Object.keys(options).forEach((key, index) => {
      let label = this.controlTypesOptions.find(option => option.value === Number(key))?.label || key;
      this.controlTypes.push({
        value: Number(key),
        count: options[key],
        label: label
      });
    });
  }

  toggleDropdown() {
    this.showDropdown = !this.showDropdown;
  }

  save() {
    this.compressedAirInventoryService.filterInventorySummary.next(this.filterInventorySummary);
    let selectedField = this.compressedAirInventorySummaryGraphsService.selectedField.getValue();
    this.compressedAirInventorySummaryGraphsService.selectedField.next(selectedField);
  }

  checkActive(controlType: number): boolean {
    let isActive = _.includes(this.filterInventorySummary.controlTypes, controlType);
    return isActive;
  }

  select(compressorType: number) {
    let classIndex: number = this.filterInventorySummary.compressorTypes.findIndex(value => { return value == compressorType });
    if (classIndex == -1) {
      this.filterInventorySummary.compressorTypes.push(compressorType);
    } else {
      this.filterInventorySummary.compressorTypes.splice(classIndex, 1);
    }
    this.save();
  }

  selectAll() {
    this.filterInventorySummary.compressorTypes = new Array();
    this.save();
  }

}
