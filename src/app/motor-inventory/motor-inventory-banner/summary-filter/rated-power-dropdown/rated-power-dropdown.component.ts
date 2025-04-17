import { Component, OnInit, Input } from '@angular/core';
import { Settings } from '../../../../shared/models/settings';
import { MotorInventoryData, MotorItem, FilterInventorySummary } from '../../../motor-inventory';
import { Subscription } from 'rxjs';
import { MotorInventoryService } from '../../../motor-inventory.service';
import { MotorInventorySummaryService } from '../../../motor-inventory-summary/motor-inventory-summary.service';
import { InventorySummaryGraphsService } from '../../../motor-inventory-summary/inventory-summary-graphs/inventory-summary-graphs.service';
import * as _ from 'lodash';
@Component({
    selector: 'app-rated-power-dropdown',
    templateUrl: './rated-power-dropdown.component.html',
    styleUrls: ['./rated-power-dropdown.component.css'],
    standalone: false
})
export class RatedPowerDropdownComponent implements OnInit {

  settings: Settings;
  ratedPowerOptions: Array<{ value: number, numMotors: number }>;
  filterInventorySummarySub: Subscription;
  filterInventorySummary: FilterInventorySummary;
  showDropdown: boolean;
  
  constructor(private motorInventoryService: MotorInventoryService, private motorInventorySummaryService: MotorInventorySummaryService, private inventorySummaryGraphService: InventorySummaryGraphsService) { }

  ngOnInit(): void {
    this.settings = this.motorInventoryService.settings.getValue();
    this.filterInventorySummarySub = this.motorInventoryService.filterInventorySummary.subscribe(val => {
      this.filterInventorySummary = val;
      this.setOptions();
    });
  }
  ngOnDestroy(){
    this.filterInventorySummarySub.unsubscribe();
  }
  setOptions() {
    this.ratedPowerOptions = new Array();
    let motorInventoryData: MotorInventoryData = this.motorInventoryService.motorInventoryData.value;
    let allMotors: Array<MotorItem> = this.motorInventorySummaryService.getAllMotors(motorInventoryData);
    let options = _.countBy(allMotors, (motor) => { return motor.nameplateData.ratedMotorPower });
    Object.keys(options).forEach((key, index) => {
      this.ratedPowerOptions.push({
        value: Number(key),
        numMotors: options[key]
      });
    });
  }

  toggleDropdown() {
    this.showDropdown = !this.showDropdown;
  }

  save() {
    this.motorInventoryService.filterInventorySummary.next(this.filterInventorySummary);
    let selectedField = this.inventorySummaryGraphService.selectedField.getValue();
    this.inventorySummaryGraphService.selectedField.next(selectedField);
  }

  checkActive(ratedPower: number): boolean {
    let isActive = _.includes(this.filterInventorySummary.ratedPower, ratedPower);
    return isActive;
  }

  select(ratedPower: number) {
    let classIndex: number = this.filterInventorySummary.ratedPower.findIndex(value => { return value == ratedPower });
    if (classIndex == -1) {
      this.filterInventorySummary.ratedPower.push(ratedPower);
    } else {
      this.filterInventorySummary.ratedPower.splice(classIndex, 1);
    }
    this.save();
  }

  selectAll() {
    this.filterInventorySummary.ratedPower = new Array();
    this.save();
  }
}
