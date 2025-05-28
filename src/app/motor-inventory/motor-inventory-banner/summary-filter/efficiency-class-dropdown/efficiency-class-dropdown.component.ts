import { Component, OnInit } from '@angular/core';
import { MotorInventoryData, MotorItem, FilterInventorySummary } from '../../../motor-inventory';
import { Subscription } from 'rxjs';
import { MotorInventoryService } from '../../../motor-inventory.service';
import { MotorInventorySummaryService } from '../../../motor-inventory-summary/motor-inventory-summary.service';
import { InventorySummaryGraphsService } from '../../../motor-inventory-summary/inventory-summary-graphs/inventory-summary-graphs.service';
import * as _ from 'lodash';

@Component({
    selector: 'app-efficiency-class-dropdown',
    templateUrl: './efficiency-class-dropdown.component.html',
    styleUrls: ['./efficiency-class-dropdown.component.css'],
    standalone: false
})
export class EfficiencyClassDropdownComponent implements OnInit {

  effiencyClassOptions: Array<{ value: number, numMotors: number }>;
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
    this.effiencyClassOptions = new Array();
    let motorInventoryData: MotorInventoryData = this.motorInventoryService.motorInventoryData.value;
    let allMotors: Array<MotorItem> = this.motorInventorySummaryService.getAllMotors(motorInventoryData);
    let options = _.countBy(allMotors, (motor) => { return motor.nameplateData.efficiencyClass });
    Object.keys(options).forEach((key, index) => {
      this.effiencyClassOptions.push({
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

  checkActive(efficiencyClass: number): boolean {
    let isActive = _.includes(this.filterInventorySummary.efficiencyClasses, efficiencyClass);
    return isActive;
  }

  select(efficiencyClass: number) {
    let classIndex: number = this.filterInventorySummary.efficiencyClasses.findIndex(id => { return id == efficiencyClass });
    if (classIndex == -1) {
      this.filterInventorySummary.efficiencyClasses.push(efficiencyClass);
    } else {
      this.filterInventorySummary.efficiencyClasses.splice(classIndex, 1);
    }
    this.save();
  }

  selectAll() {
    this.filterInventorySummary.efficiencyClasses = new Array();
    this.save();
  }
}
