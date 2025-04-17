import { Component, OnInit, Input } from '@angular/core';
import { InventoryItem } from '../../../../../shared/models/inventory/inventory';
import { MotorInventoryService } from '../../../../../motor-inventory/motor-inventory.service';
import { BatchAnalysisService, BatchAnalysisResults } from '../../../../../motor-inventory/batch-analysis/batch-analysis.service';
import { Settings } from '../../../../../shared/models/settings';
import { SettingsDbService } from '../../../../../indexedDb/settings-db.service';

@Component({
    selector: 'app-motor-inventory-card',
    templateUrl: './motor-inventory-card.component.html',
    styleUrls: ['./motor-inventory-card.component.css'],
    standalone: false
})
export class MotorInventoryCardComponent implements OnInit {
  @Input()
  inventoryItem: InventoryItem;

  numberOfDepartments: number;
  numberOfMotors: number = 0;
  paybackThreshold: number;
  numRewind: number = 0;
  numReplaceNow: number = 0;
  numReplaceWhenFail: number = 0;
  showBatchSummary: boolean = false;
  totalEnergyUse: number = 0;
  totalEnergyCost: number = 0;
  constructor(private batchAnalysisService: BatchAnalysisService, private settingsDbService: SettingsDbService) { }

  ngOnInit(): void {
    this.numberOfDepartments = this.inventoryItem.motorInventoryData.departments.length;
    this.inventoryItem.motorInventoryData.departments.forEach(department => {
      this.numberOfMotors = this.numberOfMotors + department.catalog.length;
    });
    this.inventoryItem.batchAnalysisSettings = this.batchAnalysisService.batchAnalysisSettings.getValue();

    if (this.inventoryItem.batchAnalysisSettings) {
      this.paybackThreshold = this.inventoryItem.batchAnalysisSettings.paybackThreshold;
      let settings: Settings = this.settingsDbService.getByInventoryId(this.inventoryItem);
      let analysisResults: Array<BatchAnalysisResults> = this.batchAnalysisService.getBatchAnalysisDataItems(this.inventoryItem.motorInventoryData, settings, this.inventoryItem.batchAnalysisSettings);
      analysisResults.forEach(result => {
        if (result.replaceMotor == 'Replace Now') {
          this.numReplaceNow++;
        } else if (result.replaceMotor == 'Replace When Fail') {
          this.numReplaceWhenFail++;
        } else if (result.replaceMotor == 'Rewind When Fail') {
          this.numRewind++;
        }
        if (isNaN(result.currentEnergyUse) == false) {
          this.totalEnergyUse = this.totalEnergyUse + result.currentEnergyUse;
        }
        if(isNaN(result.currentEnergyCost) == false){
          this.totalEnergyCost = this.totalEnergyCost + result.currentEnergyCost;
        }
      });
      this.showBatchSummary = (this.numRewind != 0 || this.numReplaceNow != 0 || this.numReplaceWhenFail != 0);
    }
  }

}
