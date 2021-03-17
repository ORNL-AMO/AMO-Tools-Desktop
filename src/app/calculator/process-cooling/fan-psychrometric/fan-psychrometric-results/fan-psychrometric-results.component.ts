import { Component, OnInit, Input } from '@angular/core';
import { Subscription } from 'rxjs';
import { PsychrometricResults, BaseGasDensity } from '../../../../shared/models/fans';
import { Settings } from '../../../../shared/models/settings';
import { FanPsychrometricService } from '../fan-psychrometric.service';

@Component({
  selector: 'app-fan-psychrometric-results',
  templateUrl: './fan-psychrometric-results.component.html',
  styleUrls: ['./fan-psychrometric-results.component.css']
})
export class FanPsychrometricResultsComponent implements OnInit {

  @Input() settings: Settings;

  resultData: Array<PsychrometricResults>;
  hasValidResults: boolean; 
  psychrometricResults: PsychrometricResults;
  
  resetFormSubscription: Subscription;
  calculatedBaseGasDensitySubscription: Subscription;
  constructor(private fanPsychrometricService: FanPsychrometricService) { }

  ngOnInit(): void {
    this.calculatedBaseGasDensitySubscription = this.fanPsychrometricService.calculatedBaseGasDensity.subscribe(results => {
      this.psychrometricResults = results;
      if (results) {
        let inputData: BaseGasDensity = this.fanPsychrometricService.baseGasDensityData.getValue();
        this.psychrometricResults.barometricPressure = inputData.barometricPressure;
        this.psychrometricResults.dryBulbTemp = inputData.dryBulbTemp;
      }
    });
  }



  ngOnDestroy() {
    this.calculatedBaseGasDensitySubscription.unsubscribe();
  }

}
