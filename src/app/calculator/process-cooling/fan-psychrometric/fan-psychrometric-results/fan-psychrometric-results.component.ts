import { Component, OnInit, Input } from '@angular/core';
import { Subscription } from 'rxjs';
import { PsychrometricResults, BaseGasDensity } from '../../../../shared/models/fans';
import { Settings } from '../../../../shared/models/settings';
import { FanPsychrometricService, FanPsychrometricWarnings } from '../fan-psychrometric.service';

@Component({
    selector: 'app-fan-psychrometric-results',
    templateUrl: './fan-psychrometric-results.component.html',
    styleUrls: ['./fan-psychrometric-results.component.css'],
    standalone: false
})
export class FanPsychrometricResultsComponent implements OnInit {

  @Input() settings: Settings;
  @Input()
  resultDataTable: Array<PsychrometricResults>;
  @Input()
  psychrometricResultsTable: PsychrometricResults;

  resultData: Array<PsychrometricResults>;
  hasValidResults: boolean; 
  warnings: FanPsychrometricWarnings;
  psychrometricResults: PsychrometricResults;
  
  resetFormSubscription: Subscription;
  calculatedBaseGasDensitySubscription: Subscription;
  constructor(private fanPsychrometricService: FanPsychrometricService) { }

  ngOnInit(): void {
    this.calculatedBaseGasDensitySubscription = this.fanPsychrometricService.calculatedBaseGasDensity.subscribe(results => {
      this.psychrometricResults = results;
      if (this.psychrometricResults) {
        let inputData: BaseGasDensity = this.fanPsychrometricService.baseGasDensityData.getValue();
        this.psychrometricResults.barometricPressure = inputData.barometricPressure;
        this.psychrometricResults.dryBulbTemp = inputData.dryBulbTemp;
      }
      this.warnings = this.fanPsychrometricService.checkWarnings(this.psychrometricResults);
    });
  }
  

  ngOnDestroy() {
    this.calculatedBaseGasDensitySubscription.unsubscribe();
  }

}
