import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { WasteWaterResults } from '../../../shared/models/waste-water';
import { WasteWaterService } from '../../waste-water.service';

@Component({
  selector: 'app-results-table',
  templateUrl: './results-table.component.html',
  styleUrls: ['./results-table.component.css']
})
export class ResultsTableComponent implements OnInit {

  wastWaterSub: Subscription;
  baselineResults: WasteWaterResults;
  constructor(private wasteWaterService: WasteWaterService) { }

  ngOnInit(): void {
    this.wastWaterSub = this.wasteWaterService.wasteWater.subscribe(val => {
      this.baselineResults = this.wasteWaterService.calculateResults(val.baselineData.activatedSludgeData, val.baselineData.aeratorPerformanceData, val.modelingOptions);
    });
  }

  ngOnDestroy() {
    this.wastWaterSub.unsubscribe();
  }

}
