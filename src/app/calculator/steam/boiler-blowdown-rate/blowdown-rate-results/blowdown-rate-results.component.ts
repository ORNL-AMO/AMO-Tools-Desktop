import { Component, OnInit, Input } from '@angular/core';
import { Settings } from '../../../../shared/models/settings';
import { BoilerBlowdownRateService, BoilerBlowdownRateResults } from '../boiler-blowdown-rate.service';
import { Subscription } from 'rxjs';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'app-blowdown-rate-results',
  templateUrl: './blowdown-rate-results.component.html',
  styleUrls: ['./blowdown-rate-results.component.css']
})
export class BlowdownRateResultsComponent implements OnInit {
  @Input()
  settings: Settings;

  baselineSub: Subscription;
  modificationSub: Subscription;
  baselineResults: BoilerBlowdownRateResults;
  modificationResults: BoilerBlowdownRateResults;
  modificationExists: boolean;
  constructor(private boilerBlowdownRateService: BoilerBlowdownRateService) { }

  ngOnInit() {
    this.baselineSub = this.boilerBlowdownRateService.baselineInputs.subscribe(val => {
      console.log('baseline')
      console.log(val);
      console.log('=====')
      if (val) {
        let form: FormGroup = this.boilerBlowdownRateService.getFormFromObj(val, this.settings)
        
        if (form.valid) {
          console.log('get baseline results');
          this.baselineResults = this.boilerBlowdownRateService.calculateResults(val, this.settings);
          console.log(this.baselineResults);
          console.log('=====')
        } else {
          this.baselineResults = this.getEmptyResults();
        }
      }else{
        this.baselineResults = this.getEmptyResults();
      }
    });

    this.modificationSub = this.boilerBlowdownRateService.modificationInputs.subscribe(val => {
      console.log('modification')
      console.log(val);
      console.log('=====')
      if (val) {
        this.modificationExists = false;
        let form: FormGroup = this.boilerBlowdownRateService.getFormFromObj(val, this.settings);
        if (form.valid) {
          this.modificationResults = this.boilerBlowdownRateService.calculateResults(val, this.settings);
        } else {
          this.modificationResults = this.getEmptyResults();
        }
      } else {
        this.modificationResults = this.getEmptyResults();
        this.modificationExists = false;
      }
    });
  }

  ngOnDestroy() {
    this.baselineSub.unsubscribe();
    this.modificationSub.unsubscribe();
  }

  getEmptyResults(): BoilerBlowdownRateResults {
    return {
      blowdownRate: 0,
      boilerFuelCost: 0,
      makeupWaterCost: 0,
      totalCost: 0
    }
  }
}
