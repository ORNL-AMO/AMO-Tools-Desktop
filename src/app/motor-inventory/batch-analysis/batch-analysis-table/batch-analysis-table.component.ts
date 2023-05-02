import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs';
import { BatchAnalysisService, BatchAnalysisSettings, BatchAnalysisResults } from '../batch-analysis.service';
import { MotorInventoryService } from '../../motor-inventory.service';
import { MotorCatalogService } from '../../motor-inventory-setup/motor-catalog/motor-catalog.service';
import { Settings } from '../../../shared/models/settings';

@Component({
  selector: 'app-batch-analysis-table',
  templateUrl: './batch-analysis-table.component.html',
  styleUrls: ['./batch-analysis-table.component.css']
})
export class BatchAnalysisTableComponent implements OnInit {
  @ViewChild('copyTable', { static: false }) copyTable: ElementRef;
  tableString: any;

  batchAnalysisDataItems: Array<BatchAnalysisResults>;
  batchAnalysisDataItemsSub: Subscription;
  sortByField: string = 'motorName';
  sortByDirection: string = 'desc';
  batchAnalysisSettings: BatchAnalysisSettings;
  batchAnalysisSettingsSub: Subscription;
  settings: Settings;

  constructor(private batchAnalysisService: BatchAnalysisService, private motorInventoryService: MotorInventoryService, private motorCatalogService: MotorCatalogService) { }

  ngOnInit(): void {
    this.settings = this.motorInventoryService.settings.getValue();
    this.batchAnalysisSettingsSub = this.batchAnalysisService.batchAnalysisSettings.subscribe(val => {
      this.batchAnalysisSettings = val;
    });

    this.batchAnalysisDataItemsSub = this.batchAnalysisService.batchAnalysisDataItems.subscribe(val => {
      this.batchAnalysisDataItems = val;
    });
  }

  ngOnDestroy() {
    this.batchAnalysisDataItemsSub.unsubscribe();
    this.batchAnalysisSettingsSub.unsubscribe();
  }

  setSortByField(str: string) {
    if (this.sortByField == str) {
      if (this.sortByDirection == 'desc') {
        this.sortByDirection = 'asc';
      } else {
        this.sortByDirection = 'desc';
      }
    }
    this.sortByField = str;
  }

  goToMotorItem(batchAnalysisItem: BatchAnalysisResults){
    this.motorCatalogService.selectedDepartmentId.next(batchAnalysisItem.departmentId);
    this.motorCatalogService.selectedMotorItem.next(batchAnalysisItem.motorItem);
    this.motorInventoryService.setupTab.next('motor-catalog');
    this.motorInventoryService.mainTab.next('setup');
  }

  updateTableString() {
    this.tableString = this.copyTable.nativeElement.innerText;
  }
}

