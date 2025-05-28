import { Component } from '@angular/core';
import { Settings } from '../../../../shared/models/settings';
import { Subscription } from 'rxjs';
import { FilterInventorySummary, PumpInventoryService } from '../../../pump-inventory.service';
import { PumpInventoryData, PumpInventoryDepartment } from '../../../pump-inventory';
import { PumpSummaryGraphsService } from '../../../pump-inventory-summary/inventory-summary-graphs/pump-summary-graphs.service';

@Component({
    selector: 'app-selected-options',
    templateUrl: './selected-options.component.html',
    styleUrls: ['./selected-options.component.css'],
    standalone: false
})
export class SelectedOptionsComponent {

  
  settings: Settings;
  filterInventorySummarySub: Subscription;
  filterInventorySummary: FilterInventorySummary;

  pumpInventoryData: PumpInventoryData;
  constructor(private pumpInventoryService: PumpInventoryService,
    private pumpSummaryGraphsService: PumpSummaryGraphsService) { }

  ngOnInit(): void {
    this.settings = this.pumpInventoryService.settings.getValue();
    this.pumpInventoryData = this.pumpInventoryService.pumpInventoryData.getValue();
    this.filterInventorySummarySub = this.pumpInventoryService.filterInventorySummary.subscribe(val => {
      this.filterInventorySummary = val;
    });
  }

  ngOnDestroy() {
    this.filterInventorySummarySub.unsubscribe();
  }

  save() {
    this.pumpInventoryService.filterInventorySummary.next(this.filterInventorySummary);
    let selectedField = this.pumpSummaryGraphsService.selectedField.getValue();
    this.pumpSummaryGraphsService.selectedField.next(selectedField);
  }

  removeDepartment(index: number) {
    this.filterInventorySummary.selectedDepartmentIds.splice(index, 1);
    this.save();
  }

  removeRatedPower(index: number) {
    this.filterInventorySummary.motorRatedPowerValues.splice(index, 1);
    this.save();
  }

  removePumpTypes(index: number) {
    this.filterInventorySummary.pumpTypes.splice(index, 1);
    this.save();
  }

  getDepartmentName(id: string): string {
    let department: PumpInventoryDepartment = this.pumpInventoryData.departments.find(department => { return department.id == id });
    return department.name;
  }

  clearAllFilters() {
    this.filterInventorySummary = {
      selectedDepartmentIds: [],
      motorRatedPowerValues: [],
      pumpTypes: [],
      statusValues: []
    }
    this.save();
  }
}

