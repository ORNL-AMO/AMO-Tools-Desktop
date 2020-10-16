import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { WasteWaterData, WasteWaterResults } from '../../../shared/models/waste-water';
import { WasteWaterService } from '../../waste-water.service';

@Component({
  selector: 'app-results-table',
  templateUrl: './results-table.component.html',
  styleUrls: ['./results-table.component.css']
})
export class ResultsTableComponent implements OnInit {

  wastWaterSub: Subscription;
  baselineResults: WasteWaterResults;
  modificationResults: WasteWaterResults;
  showModification: boolean;
  modificationName: string;
  constructor(private wasteWaterService: WasteWaterService) { }

  ngOnInit(): void {
    this.wastWaterSub = this.wasteWaterService.wasteWater.subscribe(val => {
      this.baselineResults = this.wasteWaterService.calculateResults(val.baselineData.activatedSludgeData, val.baselineData.aeratorPerformanceData, val.systemBasics);
      let modificationData: WasteWaterData = this.wasteWaterService.getModificationFromId();
      if (modificationData) {
        this.modificationName = modificationData.name;
        this.modificationResults = this.wasteWaterService.calculateResults(modificationData.activatedSludgeData, modificationData.aeratorPerformanceData, val.systemBasics);
        this.showModification = true;
      }else{
        this.modificationName = undefined;
        this.showModification = false;
      }
    });
  }

  ngOnDestroy() {
    this.wastWaterSub.unsubscribe();
  }

}
