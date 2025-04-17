import { Component, OnInit } from '@angular/core';
import { MotorInventoryData, FilterInventorySummary } from '../../../motor-inventory';
import { Subscription } from 'rxjs';
import { MotorInventoryService } from '../../../motor-inventory.service';
import { InventorySummaryGraphsService } from '../../../motor-inventory-summary/inventory-summary-graphs/inventory-summary-graphs.service';
import * as _ from 'lodash';

@Component({
    selector: 'app-department-dropdown',
    templateUrl: './department-dropdown.component.html',
    styleUrls: ['./department-dropdown.component.css'],
    standalone: false
})
export class DepartmentDropdownComponent implements OnInit {
  
  departmentsDropdown: boolean = false;
  motorInventoryData: MotorInventoryData
  filterInventorySummarySub: Subscription;
  filterInventorySummary: FilterInventorySummary;
  constructor(private motorInventoryService: MotorInventoryService, private inventorySummaryGraphService: InventorySummaryGraphsService) { }

  ngOnInit(): void {
    this.motorInventoryData = this.motorInventoryService.motorInventoryData.value;

    this.filterInventorySummarySub = this.motorInventoryService.filterInventorySummary.subscribe(val => {
      this.filterInventorySummary = val;
    });
  }

  ngOnDestroy() {
    this.filterInventorySummarySub.unsubscribe();
  }

  toggleDepartments() {
    this.departmentsDropdown = !this.departmentsDropdown;
  }

  save() {
    this.motorInventoryService.filterInventorySummary.next(this.filterInventorySummary);
    let selectedField = this.inventorySummaryGraphService.selectedField.getValue();
    this.inventorySummaryGraphService.selectedField.next(selectedField);
  }

  checkActive(departmentId: string): boolean {
    let isActive = _.includes(this.filterInventorySummary.selectedDepartmentIds, departmentId);
    return isActive;
  }

  selectDepartment(departmentId: string) {
    let departmentIndex: number = this.filterInventorySummary.selectedDepartmentIds.findIndex(id => { return id == departmentId });
    if (departmentIndex == -1) {
      this.filterInventorySummary.selectedDepartmentIds.push(departmentId);
    } else {
      this.filterInventorySummary.selectedDepartmentIds.splice(departmentIndex, 1);
    }
    this.save();
  }

  selectAllDepartments(){
    this.filterInventorySummary.selectedDepartmentIds = new Array();
    this.save();
  }
}
