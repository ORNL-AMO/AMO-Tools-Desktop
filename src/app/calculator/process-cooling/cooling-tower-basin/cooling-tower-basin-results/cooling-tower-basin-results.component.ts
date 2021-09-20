import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs';
import { CoolingTowerBasinOutput, WeatherBinnedResult } from '../../../../shared/models/chillers';
import { Settings } from '../../../../shared/models/settings';
import { CoolingTowerBasinService } from '../cooling-tower-basin.service';

@Component({
  selector: 'app-cooling-tower-basin-results',
  templateUrl: './cooling-tower-basin-results.component.html',
  styleUrls: ['./cooling-tower-basin-results.component.css']
})
export class CoolingTowerBasinResultsComponent implements OnInit {
  @Input()
  settings: Settings;
  @Input()
  modificationExists: boolean;

  @ViewChild('copyTable0', { static: false }) copyTable0: ElementRef;
  table0String: any;
  @ViewChild('copyTable1', { static: false }) copyTable1: ElementRef;
  table1String: any;
  @ViewChild('copyTable2', { static: false }) copyTable2: ElementRef;
  table2String: any;

  outputSubscription: Subscription;
  isShowingWeatherResultsSub: Subscription;
  output: CoolingTowerBasinOutput;
  selectedWeatherBinResult: WeatherBinnedResult;
  weatherBinnedResults: Array<WeatherBinnedResult> = [];
  isShowingWeatherResults: boolean;

  constructor(private coolingTowerBasinService: CoolingTowerBasinService) { }

  ngOnInit(): void {
    this.outputSubscription = this.coolingTowerBasinService.coolingTowerBasinOutput.subscribe(val => {
      this.output = val;
      this.setWeatherBinnedResults(val);
    });
    this.isShowingWeatherResultsSub = this.coolingTowerBasinService.isShowingWeatherResults.subscribe(value => {
      this.isShowingWeatherResults = value;
    });
  }

  ngOnDestroy() {
    this.outputSubscription.unsubscribe();
    this.isShowingWeatherResultsSub.unsubscribe();
  }

  setWeatherBinnedResults(output: CoolingTowerBasinOutput) {
    if (output.weatherBinnedResults && output.weatherBinnedResults.length > 0) {
      if (!this.selectedWeatherBinResult) {
        this.selectedWeatherBinResult = output.weatherBinnedResults[0];
      }
      this.weatherBinnedResults = output.weatherBinnedResults;
    }
  }

  updateTable0String() {
    this.table0String = this.copyTable0.nativeElement.innerText + this.copyTable1.nativeElement.innerText + this.copyTable2.nativeElement.innerText;
  }

}