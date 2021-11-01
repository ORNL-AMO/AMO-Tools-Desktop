import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { Settings } from '../../../shared/models/settings';
import { WasteWaterData, WasteWaterResults, WasteWaterValid } from '../../../shared/models/waste-water';
import { WasteWaterService } from '../../waste-water.service';

@Component({
  selector: 'app-results-table',
  templateUrl: './results-table.component.html',
  styleUrls: ['./results-table.component.css']
})
export class ResultsTableComponent implements OnInit {

  wasteWaterSub: Subscription;
  modificationValid: WasteWaterValid;
  baselineResults: WasteWaterResults;
  modificationResults: WasteWaterResults;
  showModification: boolean;
  modificationName: string;
  settings: Settings;
  baselineConditions: DisplayConditions;
  modificationConditions: DisplayConditions;
  MLSSpar: {baseline: number, modification: number} = {baseline: 0, modification: 0};
  SRT: {baseline: number, modification: number} = {baseline: 0, modification: 0};

  constructor(private wasteWaterService: WasteWaterService) { }

  ngOnInit(): void {
    this.initDisplayConditions();
    this.settings = this.wasteWaterService.settings.getValue();
    this.wasteWaterSub = this.wasteWaterService.wasteWater.subscribe(val => {
      this.baselineResults = this.wasteWaterService.calculateResults(val.baselineData.activatedSludgeData, val.baselineData.aeratorPerformanceData, val.baselineData.operations, this.settings, false);
      this.checkDisplayConditions(val.baselineData, this.baselineConditions);
      this.setResultsByControlPoint(val.baselineData, this.baselineResults, 'baseline');
      let modificationData: WasteWaterData = this.wasteWaterService.getModificationFromId();
      let mainTab: string = this.wasteWaterService.mainTab.getValue();
      if (modificationData && mainTab == 'assessment') {
        this.modificationValid = modificationData.valid;
        this.modificationName = modificationData.name;
        this.modificationResults = this.wasteWaterService.calculateResults(modificationData.activatedSludgeData, modificationData.aeratorPerformanceData, modificationData.operations, this.settings, false, this.baselineResults);
        this.checkDisplayConditions(modificationData, this.modificationConditions);
        this.setResultsByControlPoint(modificationData, this.modificationResults, 'modification');
        this.showModification = true;
      } else {
        this.modificationName = undefined;
        this.showModification = false;
        this.modificationValid = undefined;
      }
    });
    
  }

  ngOnDestroy() {
    this.wasteWaterSub.unsubscribe();
  }

  setResultsByControlPoint(wasteWaterData: WasteWaterData, results: WasteWaterResults, resultType: string) {
    if (wasteWaterData.activatedSludgeData.CalculateGivenSRT == true) {
        this.MLSSpar[resultType] = results.MLSS;
        this.SRT[resultType] = wasteWaterData.activatedSludgeData.DefinedSRT;
    } else {
        this.MLSSpar[resultType] = wasteWaterData.activatedSludgeData.MLSSpar;
        this.SRT[resultType] = results.SolidsRetentionTime;
    }
  }

  initDisplayConditions() {
    this.baselineConditions = {
      hasAnoxicZone: undefined,
    };
    this.modificationConditions = {
      hasAnoxicZone: undefined,
    };
  }

  checkDisplayConditions(wasteWaterData: WasteWaterData, conditions: DisplayConditions) {
    conditions.hasAnoxicZone = wasteWaterData.aeratorPerformanceData.AnoxicZoneCondition == true;
  }

}

export interface DisplayConditions {
  hasAnoxicZone: boolean,
}