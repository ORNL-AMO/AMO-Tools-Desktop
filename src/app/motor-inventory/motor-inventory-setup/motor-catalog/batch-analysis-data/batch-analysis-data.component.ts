import { Component, OnInit } from '@angular/core';
import { UntypedFormGroup } from '@angular/forms';
import { Subscription } from 'rxjs';
import { MotorCatalogService } from '../motor-catalog.service';
import { MotorInventoryService } from '../../../motor-inventory.service';
import { BatchAnalysisDataService } from './batch-analysis-data.service';
import { MotorItem, BatchAnalysisOptions } from '../../../motor-inventory';
import { Settings } from '../../../../shared/models/settings';

@Component({
  selector: 'app-batch-analysis-data',
  templateUrl: './batch-analysis-data.component.html',
  styleUrls: ['./batch-analysis-data.component.css']
})
export class BatchAnalysisDataComponent implements OnInit {
  settingsSub: Subscription;
  settings: Settings;

  motorForm: UntypedFormGroup;
  selectedMotorItemSub: Subscription
  displayOptions: BatchAnalysisOptions;
  displayForm: boolean = true;
  constructor(private motorCatalogService: MotorCatalogService, private motorInventoryService: MotorInventoryService,
    private batchAnalysisDataService: BatchAnalysisDataService) { }

  ngOnInit(): void {
    this.settingsSub = this.motorInventoryService.settings.subscribe(val => {
      this.settings = val;
    });
    this.selectedMotorItemSub = this.motorCatalogService.selectedMotorItem.subscribe(selectedMotor => {
      if (selectedMotor) {
        this.motorForm = this.batchAnalysisDataService.getFormFromBatchAnalysisData(selectedMotor.batchAnalysisData);
      }
    });
    this.displayOptions = this.motorInventoryService.motorInventoryData.getValue().displayOptions.batchAnalysisOptions;
  }

  ngOnDestroy() {
    this.selectedMotorItemSub.unsubscribe();
    this.settingsSub.unsubscribe();
  }

  save() {
    let selectedMotor: MotorItem = this.motorCatalogService.selectedMotorItem.getValue();
    selectedMotor.batchAnalysisData = this.batchAnalysisDataService.updateBatchAnalysisDataFromForm(this.motorForm, selectedMotor.batchAnalysisData);
    this.motorInventoryService.updateMotorItem(selectedMotor);
  }

  focusField(str: string) {
    this.motorInventoryService.focusedDataGroup.next('batch-analysis')
    this.motorInventoryService.focusedField.next(str);
  }

  toggleForm() {
    this.displayForm = !this.displayForm;
    // this.focusOut();
  }

  // focusOut() {
  //   this.motorInventoryService.focusedDataGroup.next('batch-analysis')
  //   this.motorInventoryService.focusedField.next('default');
  // }
}
