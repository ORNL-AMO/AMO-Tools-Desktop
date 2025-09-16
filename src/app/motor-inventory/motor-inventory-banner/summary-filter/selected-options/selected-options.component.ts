import { Component, OnInit, Input } from '@angular/core';
import { MotorInventorySummaryService } from '../../../motor-inventory-summary/motor-inventory-summary.service';
import { FilterInventorySummary, MotorInventoryData, MotorInventoryDepartment } from '../../../motor-inventory';
import { Subscription } from 'rxjs';
import { MotorInventoryService } from '../../../motor-inventory.service';
import { Settings } from '../../../../shared/models/settings';
import { InventorySummaryGraphsService } from '../../../motor-inventory-summary/inventory-summary-graphs/inventory-summary-graphs.service';

@Component({
    selector: 'app-selected-options',
    templateUrl: './selected-options.component.html',
    styleUrls: ['./selected-options.component.css'],
    standalone: false
})
export class SelectedOptionsComponent implements OnInit {

  
  settings: Settings;
  filterInventorySummarySub: Subscription;
  filterInventorySummary: FilterInventorySummary;

  motorInventoryData: MotorInventoryData;
  constructor(private motorInventoryService: MotorInventoryService,
    private inventorySummaryGraphService: InventorySummaryGraphsService) { }

  ngOnInit(): void {
    this.settings = this.motorInventoryService.settings.getValue();
    this.motorInventoryData = this.motorInventoryService.motorInventoryData.getValue();
    this.filterInventorySummarySub = this.motorInventoryService.filterInventorySummary.subscribe(val => {
      this.filterInventorySummary = val;
    });
  }

  ngOnDestroy() {
    this.filterInventorySummarySub.unsubscribe();
  }

  save() {
    this.motorInventoryService.filterInventorySummary.next(this.filterInventorySummary);
    let selectedField = this.inventorySummaryGraphService.selectedField.getValue();
    this.inventorySummaryGraphService.selectedField.next(selectedField);
  }

  removeEfficiencyClass(index: number) {
    this.filterInventorySummary.efficiencyClasses.splice(index, 1);
    this.save();
  }

  removeDepartment(index: number) {
    this.filterInventorySummary.selectedDepartmentIds.splice(index, 1);
    this.save();
  }

  removeRatedPower(index: number) {
    this.filterInventorySummary.ratedPower.splice(index, 1);
    this.save();
  }

  removeRatedVoltage(index: number) {
    this.filterInventorySummary.ratedVoltage.splice(index, 1);
    this.save();
  }

  getDepartmentName(id: string): string {
    let department: MotorInventoryDepartment = this.motorInventoryData.departments.find(department => { return department.id == id });
    return department.name;
  }

  clearAllFilters() {
    this.filterInventorySummary = {
      selectedDepartmentIds: [],
      efficiencyClasses: [],
      ratedPower: [],
      ratedVoltage: []
    }
    this.save();
  }
}

