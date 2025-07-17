import { Component } from '@angular/core';
import { CompressedAirInventoryData, CompressedAirItem } from '../../../compressed-air-inventory';
import { CompressedAirInventoryService, FilterInventorySummary } from '../../../compressed-air-inventory.service';
import { CompressedAirInventorySummaryService } from '../../../compressed-air-inventory-summary/compressed-air-inventory-summary.service';
import { CompressedAirInventorySummaryGraphsService } from '../../../compressed-air-inventory-summary/compressed-air-inventory-summary-graphs/compressed-air-inventory-summary-graphs.service';
import { Settings } from '../../../../shared/models/settings';
import { Subscription } from 'rxjs';
import _ from 'lodash';

@Component({
  selector: 'app-compressor-type-dropdown',
  templateUrl: './compressor-type-dropdown.component.html',
  styleUrl: './compressor-type-dropdown.component.css',
  standalone: false
})
export class CompressorTypeDropdownComponent {
  settings: Settings;
  compressorTypes: Array<{ value: number, count: number }>;
  filterInventorySummarySub: Subscription;
  filterInventorySummary: FilterInventorySummary;
  showDropdown: boolean;

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
    this.compressorTypes = new Array();
    let compressedAirInventoryData: CompressedAirInventoryData = this.compressedAirInventoryService.compressedAirInventoryData.value;
    let allCompressors: Array<CompressedAirItem> = this.compressedAirInventorySummaryService.getAllCompressors(compressedAirInventoryData);
    let options = _.countBy(allCompressors, (compressor: CompressedAirItem) => { return compressor.nameplateData.compressorType });
    Object.keys(options).forEach((key, index) => {
      this.compressorTypes.push({
        value: Number(key),
        count: options[key]
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

  checkActive(compressorType: number): boolean {
    let isActive = _.includes(this.filterInventorySummary.compressorTypes, compressorType);
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
