import { Component } from '@angular/core';
import { Settings } from '../../../../shared/models/settings';
import { Subscription } from 'rxjs';
import { FilterInventorySummary, PumpInventoryService } from '../../../pump-inventory.service';
import { PumpInventorySummaryService } from '../../../pump-inventory-summary/pump-inventory-summary.service';
import { PumpSummaryGraphsService } from '../../../pump-inventory-summary/inventory-summary-graphs/pump-summary-graphs.service';
import { PumpInventoryData, PumpItem } from '../../../pump-inventory';
import * as _ from 'lodash';

@Component({
  selector: 'app-rated-power-dropdown',
  templateUrl: './rated-power-dropdown.component.html',
  styleUrls: ['./rated-power-dropdown.component.css']
})
export class RatedPowerDropdownComponent {

  settings: Settings;
  ratedPowerOptions: Array<{ value: number, count: number }>;
  filterInventorySummarySub: Subscription;
  filterInventorySummary: FilterInventorySummary;
  showDropdown: boolean;
  
  constructor(private pumpInventoryService: PumpInventoryService, private pumpInventorySummaryService: PumpInventorySummaryService, private pumpSummaryGraphsService: PumpSummaryGraphsService) { }

  ngOnInit(): void {
    this.settings = this.pumpInventoryService.settings.getValue();
    this.filterInventorySummarySub = this.pumpInventoryService.filterInventorySummary.subscribe(val => {
      this.filterInventorySummary = val;
      this.setOptions();
    });
  }
  ngOnDestroy(){
    this.filterInventorySummarySub.unsubscribe();
  }
  setOptions() {
    this.ratedPowerOptions = new Array();
    let motorInventoryData: PumpInventoryData = this.pumpInventoryService.pumpInventoryData.value;
    let allPumps: Array<PumpItem> = this.pumpInventorySummaryService.getAllPumps(motorInventoryData);
    let options = _.countBy(allPumps, (pump: PumpItem) => { return pump.pumpMotor.motorRatedPower });
    Object.keys(options).forEach((key, index) => {
      this.ratedPowerOptions.push({
        value: Number(key),
        count: options[key]
      });
    });
  }

  toggleDropdown() {
    this.showDropdown = !this.showDropdown;
  }

  save() {
    this.pumpInventoryService.filterInventorySummary.next(this.filterInventorySummary);
    let selectedField = this.pumpSummaryGraphsService.selectedField.getValue();
    this.pumpSummaryGraphsService.selectedField.next(selectedField);
  }

  checkActive(ratedPower: number): boolean {
    let isActive = _.includes(this.filterInventorySummary.motorRatedPowerValues, ratedPower);
    return isActive;
  }

  select(ratedPower: number) {
    let classIndex: number = this.filterInventorySummary.motorRatedPowerValues.findIndex(value => { return value == ratedPower });
    if (classIndex == -1) {
      this.filterInventorySummary.motorRatedPowerValues.push(ratedPower);
    } else {
      this.filterInventorySummary.motorRatedPowerValues.splice(classIndex, 1);
    }
    this.save();
  }

  selectAll() {
    this.filterInventorySummary.motorRatedPowerValues = new Array();
    this.save();
  }
}
