import { Component, OnInit } from '@angular/core';
import { MotorInventoryData, MotorItem, FilterInventorySummary } from '../../../motor-inventory';
import { Subscription } from 'rxjs';
import { MotorInventoryService } from '../../../motor-inventory.service';
import { MotorInventorySummaryService } from '../../../motor-inventory-summary/motor-inventory-summary.service';
import { InventorySummaryGraphsService } from '../../../motor-inventory-summary/inventory-summary-graphs/inventory-summary-graphs.service';
import * as _ from 'lodash';

@Component({
    selector: 'app-rated-voltage-dropdown',
    templateUrl: './rated-voltage-dropdown.component.html',
    styleUrls: ['./rated-voltage-dropdown.component.css'],
    standalone: false
})
export class RatedVoltageDropdownComponent implements OnInit {

  ratedVoltageOptions: Array<{ value: number, numMotors: number }>;
  filterInventorySummarySub: Subscription;
  filterInventorySummary: FilterInventorySummary;
  showDropdown: boolean;
  
  constructor(private motorInventoryService: MotorInventoryService, private motorInventorySummaryService: MotorInventorySummaryService, private inventorySummaryGraphService: InventorySummaryGraphsService) { }

  ngOnInit(): void {
    this.filterInventorySummarySub = this.motorInventoryService.filterInventorySummary.subscribe(val => {
      this.filterInventorySummary = val;
      this.setOptions();
    });
  }

  ngOnDestroy(){
    this.filterInventorySummarySub.unsubscribe();
  }
  setOptions() {
    this.ratedVoltageOptions = new Array();
    let motorInventoryData: MotorInventoryData = this.motorInventoryService.motorInventoryData.value;
    let allMotors: Array<MotorItem> = this.motorInventorySummaryService.getAllMotors(motorInventoryData);
    let options = _.countBy(allMotors, (motor) => { return motor.nameplateData.ratedVoltage });
    Object.keys(options).forEach((key, index) => {
      this.ratedVoltageOptions.push({
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

  checkActive(ratedVoltage: number): boolean {
    let isActive = _.includes(this.filterInventorySummary.ratedVoltage, ratedVoltage);
    return isActive;
  }

  select(ratedVoltage: number) {
    let classIndex: number = this.filterInventorySummary.ratedVoltage.findIndex(value => { return value == ratedVoltage });
    if (classIndex == -1) {
      this.filterInventorySummary.ratedVoltage.push(ratedVoltage);
    } else {
      this.filterInventorySummary.ratedVoltage.splice(classIndex, 1);
    }
    this.save();
  }

  selectAll() {
    this.filterInventorySummary.ratedVoltage = new Array();
    this.save();
  }
}
