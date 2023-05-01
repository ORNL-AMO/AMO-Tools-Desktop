import { Component } from '@angular/core';
import { FilterInventorySummary, PumpInventoryService } from '../../../pump-inventory.service';
import { PumpSummaryGraphsService } from '../../../pump-inventory-summary/inventory-summary-graphs/pump-summary-graphs.service';
import { PumpInventoryData } from '../../../pump-inventory';
import { Subscription } from 'rxjs';
import * as _ from 'lodash';

@Component({
  selector: 'app-department-dropdown',
  templateUrl: './department-dropdown.component.html',
  styleUrls: ['./department-dropdown.component.css']
})
export class DepartmentDropdownComponent {

  departmentsDropdown: boolean = false;
  pumpInventoryData: PumpInventoryData;
  filterInventorySummarySub: Subscription;
  filterInventorySummary: FilterInventorySummary;
  constructor(private pumpInventoryService: PumpInventoryService, private inventorySummaryGraphService: PumpSummaryGraphsService) { }

  ngOnInit(): void {
    this.pumpInventoryData = this.pumpInventoryService.pumpInventoryData.value;

    this.filterInventorySummarySub = this.pumpInventoryService.filterInventorySummary.subscribe(val => {
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
    this.pumpInventoryService.filterInventorySummary.next(this.filterInventorySummary);
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
