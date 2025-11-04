import { Component } from '@angular/core';
import { Settings } from '../../../../shared/models/settings';
import { Subscription } from 'rxjs';
import { CompressedAirInventoryService, FilterInventorySummary } from '../../../compressed-air-inventory.service';
import { CompressedAirInventorySummaryService } from '../../../compressed-air-inventory-summary/compressed-air-inventory-summary.service';
import { CompressedAirInventorySummaryGraphsService } from '../../../compressed-air-inventory-summary/compressed-air-inventory-summary-graphs/compressed-air-inventory-summary-graphs.service';
import { CompressedAirInventoryData, CompressedAirItem } from '../../../compressed-air-inventory';
import _ from 'lodash';

@Component({
  selector: 'app-horsepower-dropdown',
  templateUrl: './horsepower-dropdown.component.html',
  styleUrl: './horsepower-dropdown.component.css',
  standalone: false
})
export class HorsepowerDropdownComponent {
  settings: Settings;
  horsepowerTypes: Array<{ value: number, count: number }>;
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
    this.horsepowerTypes = new Array();
    let compressedAirInventoryData: CompressedAirInventoryData = this.compressedAirInventoryService.compressedAirInventoryData.value;
    let allCompressors: Array<CompressedAirItem> = this.compressedAirInventorySummaryService.getAllCompressors(compressedAirInventoryData);
    let options = _.countBy(allCompressors, (compressor: CompressedAirItem) => { return compressor.compressedAirMotor.motorPower });
    Object.keys(options).forEach((key, index) => {
      this.horsepowerTypes.push({
        value: Number(key),
        count: options[key],
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

  checkActive(horsepowerType: number): boolean {
    let isActive = _.includes(this.filterInventorySummary.horsepowerTypes, horsepowerType);
    return isActive;
  }

  select(horsepowerType: number) {
    let classIndex: number = this.filterInventorySummary.horsepowerTypes.findIndex(value => { return value == horsepowerType });
    if (classIndex == -1) {
      this.filterInventorySummary.horsepowerTypes.push(horsepowerType);
    } else {
      this.filterInventorySummary.horsepowerTypes.splice(classIndex, 1);
    }
    this.save();
  }

  selectAll() {
    this.filterInventorySummary.horsepowerTypes = new Array();
    this.save();
  }
}
