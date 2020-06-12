import { Component, OnInit, Input } from '@angular/core';
import { Subscription } from 'rxjs';
import { PsychometricResults, BaseGasDensity } from '../../../../shared/models/fans';
import { Settings } from '../../../../shared/models/settings';
import { FanPsychometricService } from '../fan-psychometric.service';

@Component({
  selector: 'app-fan-psychometric-results',
  templateUrl: './fan-psychometric-results.component.html',
  styleUrls: ['./fan-psychometric-results.component.css']
})
export class FanPsychometricResultsComponent implements OnInit {

  @Input() settings: Settings;

  resultData: Array<PsychometricResults>;
  hasValidResults: boolean; 
  psychometricResults: PsychometricResults;
  
  resetFormSubscription: Subscription;
  calculatedBaseGasDensitySubscription: Subscription;
  modificationName: string;
  constructor(private fanPsychometricService: FanPsychometricService) { }

  ngOnInit(): void {
    this.calculatedBaseGasDensitySubscription = this.fanPsychometricService.calculatedBaseGasDensity.subscribe(results => {
      this.psychometricResults = results;
      if (results) {
        let inputData: BaseGasDensity = this.fanPsychometricService.baseGasDensityData.getValue();
        this.psychometricResults.barometricPressure = inputData.barometricPressure;
        this.psychometricResults.dryBulbTemp = inputData.dryBulbTemp;
      }
    });
  }



  ngOnDestroy() {
    this.calculatedBaseGasDensitySubscription.unsubscribe();
  }

}
