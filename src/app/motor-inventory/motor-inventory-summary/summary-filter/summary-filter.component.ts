import { Component, OnInit } from '@angular/core';
import { MotorInventoryService } from '../../motor-inventory.service';
import { MotorInventoryData } from '../../motor-inventory';
import { MotorInventorySummaryService } from '../motor-inventory-summary.service';
import { Subscription } from 'rxjs';
import { InventorySummaryGraphsService } from '../inventory-summary-graphs/inventory-summary-graphs.service';

@Component({
  selector: 'app-summary-filter',
  templateUrl: './summary-filter.component.html',
  styleUrls: ['./summary-filter.component.css']
})
export class SummaryFilterComponent implements OnInit {

  departmentsDropdown: boolean = false;
  motorInventoryData: MotorInventoryData
  filterInventorySummarySub: Subscription;
  filterInventorySummary: { selectedDepartmentIds: Array<string> };
  constructor(private motorInventoryService: MotorInventoryService, private motorInventorySummaryService: MotorInventorySummaryService,
    private inventorySummaryGraphService: InventorySummaryGraphsService) { }

  ngOnInit(): void {
    this.motorInventoryData = this.motorInventoryService.motorInventoryData.value;

    this.filterInventorySummarySub = this.motorInventorySummaryService.filterInventorySummary.subscribe(val => {
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
    this.motorInventorySummaryService.filterInventorySummary.next(this.filterInventorySummary);
    let selectedField = this.inventorySummaryGraphService.selectedField.getValue();
    this.inventorySummaryGraphService.selectedField.next(selectedField);
  }

  checkActive(departmentId: string): boolean {
    let department = this.filterInventorySummary.selectedDepartmentIds.find(id => { return id == departmentId });
    if (department) {
      return true;
    } else {
      return false;
    }
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
