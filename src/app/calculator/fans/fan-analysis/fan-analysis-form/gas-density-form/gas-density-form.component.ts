import { Component, OnInit, Input } from '@angular/core';
import { ConvertUnitsService } from '../../../../../shared/convert-units/convert-units.service';
import { BaseGasDensity, PsychrometricResults } from '../../../../../shared/models/fans';
import { Settings } from '../../../../../shared/models/settings';
import { FormGroup } from '@angular/forms';
import { GasDensityFormService, GasDensityRanges } from './gas-density-form.service';
import { FsatService } from '../../../../../fsat/fsat.service';
import { FanAnalysisService } from '../../fan-analysis.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-gas-density-form',
  templateUrl: './gas-density-form.component.html',
  styleUrls: ['./gas-density-form.component.css']
})
export class GasDensityFormComponent implements OnInit {
  @Input()
  settings: Settings;

  gasDensityForm: FormGroup;

  methods: Array<{ display: string, value: string }> = [
    { display: 'Relative Humidity %', value: 'relativeHumidity' },
    { display: 'Wet Bulb Temperature', value: 'wetBulb' },
    { display: 'Gas Dew Point', value: 'dewPoint' },
    { display: 'Use Custom Density', value: 'custom' },
  ];

  gasTypes: Array<{ display: string, value: string }> = [
    { display: 'Air', value: 'AIR' },
    { display: 'Other Gas', value: 'OTHER' }
  ];

  gasDensity: number;
  resetFormSubscription: Subscription;
  constructor(private convertUnitsService: ConvertUnitsService, private gasDensityFormService: GasDensityFormService, private fsatService: FsatService,
    private fanAnalysisService: FanAnalysisService) { }

  ngOnInit() {
    this.gasDensityForm = this.gasDensityFormService.getGasDensityFormFromObj(this.fanAnalysisService.inputData.BaseGasDensity, this.settings);
    this.getResults();
    this.gasDensity = this.fanAnalysisService.inputData.BaseGasDensity.gasDensity;
    this.resetFormSubscription = this.fanAnalysisService.resetForms.subscribe(val => {
      if (val == true) {
        this.resetData();
      }
    })
  }

  ngOnDestroy() {
    this.resetFormSubscription.unsubscribe();
    this.gasDensityFormService.baselinePsychrometricResults.next(undefined);
    this.gasDensityFormService.baselineCalculationType.next(undefined);
  }

  resetData() {
    this.gasDensityForm = this.gasDensityFormService.getGasDensityFormFromObj(this.fanAnalysisService.inputData.BaseGasDensity, this.settings);
  }

  save() {
    this.fanAnalysisService.inputData.BaseGasDensity = this.gasDensityFormService.getGasDensityObjFromForm(this.gasDensityForm);
    this.gasDensity = this.fanAnalysisService.inputData.BaseGasDensity.gasDensity;
    this.fanAnalysisService.getResults.next(true);
  }

  focusField(str: string) {
    this.fanAnalysisService.currentField.next(str);
  }

  getResults() {
    let psychrometricResults: PsychrometricResults;
    if (this.gasDensityForm.controls.inputType.value === 'relativeHumidity') {
      psychrometricResults = this.calcPsychrometricRelativeHumidity();
    } else if (this.gasDensityForm.controls.inputType.value === 'wetBulb') {
      psychrometricResults = this.calcPsychrometricWetBulb();
    } else if (this.gasDensityForm.controls.inputType.value === 'dewPoint') {
      psychrometricResults = this.calcPsychrometricDewPoint();
    }
    
    if (this.gasDensityForm.controls.inputType.value != 'custom') {
      if (psychrometricResults && isNaN(psychrometricResults.gasDensity) === false) {
        this.gasDensityForm.patchValue({
          gasDensity: psychrometricResults.gasDensity
        });
      } else {
        this.gasDensityForm.patchValue({
          gasDensity: undefined
        });
      }
    } 
    
    if (psychrometricResults) {
      psychrometricResults.dryBulbTemp = this.gasDensityForm.controls.dryBulbTemp.value;
      psychrometricResults.barometricPressure = this.gasDensityForm.controls.barometricPressure.value;
    }
    this.gasDensityFormService.baselinePsychrometricResults.next(psychrometricResults);
    this.gasDensityFormService.baselineCalculationType.next(this.gasDensityForm.controls.inputType.value);
    this.save();
  }

  calcPsychrometricWetBulb(): PsychrometricResults {
    let psychrometricResults: PsychrometricResults;
    if (this.isWetBulbValid()) {
      let tmpObj: BaseGasDensity = this.gasDensityFormService.getGasDensityObjFromForm(this.gasDensityForm);
      psychrometricResults = this.fsatService.getPsychrometricWetBulb(tmpObj, this.settings);
    }
    return psychrometricResults;
  }

  isWetBulbValid(): boolean {
    //dry bulb
    //static pressure
    //specific gravity
    //wet bulb temp
    return (this.gasDensityForm.controls.dryBulbTemp.valid && this.gasDensityForm.controls.staticPressure.valid
      && this.gasDensityForm.controls.specificGravity.valid && this.gasDensityForm.controls.wetBulbTemp.valid);
  }

  calcPsychrometricRelativeHumidity(): PsychrometricResults {
    let psychrometricResults: PsychrometricResults;
    if (this.isRelativeHumidityValid()) {
      let tmpObj: BaseGasDensity = this.gasDensityFormService.getGasDensityObjFromForm(this.gasDensityForm);
      psychrometricResults = this.fsatService.getPsychrometricRelativeHumidity(tmpObj, this.settings);
    }
    return psychrometricResults;
  }

  isRelativeHumidityValid(): boolean {
    //dry bulb
    //static pressure
    //specific gravity
    //relativeHumidity
    return (this.gasDensityForm.controls.dryBulbTemp.valid && this.gasDensityForm.controls.staticPressure.valid
      && this.gasDensityForm.controls.specificGravity.valid && this.gasDensityForm.controls.relativeHumidity.valid);
  }

  calcPsychrometricDewPoint(): PsychrometricResults {
    let psychrometricResults: PsychrometricResults;
    if (this.isDewPointValid()) {
      let tmpObj: BaseGasDensity = this.gasDensityFormService.getGasDensityObjFromForm(this.gasDensityForm);
      psychrometricResults = this.fsatService.getPsychrometricDewPoint(tmpObj, this.settings);
    }
    return psychrometricResults;
  }

  isDewPointValid() {
    //dry bulb
    //static pressure
    //specific gravity
    //dewPoint
    return (this.gasDensityForm.controls.dryBulbTemp.valid && this.gasDensityForm.controls.staticPressure.valid
      && this.gasDensityForm.controls.specificGravity.valid && this.gasDensityForm.controls.dewPoint.valid);
  }

  setValidators() {
    let ranges: GasDensityRanges = this.gasDensityFormService.getGasDensityRanges(this.settings, this.gasDensityForm.controls.dryBulbTemp.value);
    this.gasDensityFormService.setRelativeHumidityValidators(this.gasDensityForm);
    this.gasDensityFormService.setWetBulbValidators(this.gasDensityForm, ranges);
    this.gasDensityFormService.setDewPointValidators(this.gasDensityForm, ranges);
    this.gasDensityFormService.setCustomValidators(this.gasDensityForm, ranges);
    this.getResults();
  }
}
