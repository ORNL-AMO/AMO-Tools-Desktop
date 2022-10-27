import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FsatService } from '../../../../fsat/fsat.service';
import { UntypedFormGroup } from '@angular/forms';
import { BaseGasDensity, PsychrometricResults } from '../../../../shared/models/fans';
import { FsatFluidService, GasDensityValidators } from '../../../../fsat/fsat-fluid/fsat-fluid.service';
import { Settings } from '../../../../shared/models/settings';
import { FlueGasCompareService } from '../flue-gas-compare.service';

@Component({
  selector: 'app-flue-gas-losses-moisture',
  templateUrl: './flue-gas-losses-moisture.component.html',
  styleUrls: ['./flue-gas-losses-moisture.component.css']
})
export class FlueGasLossesMoistureComponent implements OnInit {
  @Input()
  settings: Settings;

  @Output('hideModal')
  hideModal = new EventEmitter<number>();

  gasDensityForm: UntypedFormGroup;

  methods: Array<{ display: string, value: string }> = [
    { display: 'Relative Humidity %', value: 'relativeHumidity' },
    { display: 'Wet Bulb Temperature', value: 'wetBulb' },
    { display: 'Gas Dew Point', value: 'dewPoint' },
  ];

  gasTypes: Array<{ display: string, value: string }> = [
    { display: 'Air', value: 'AIR' },
    { display: 'Other Gas', value: 'OTHER' }
  ];

  moistureInCombustionAir: number;
  constructor(
    private fsatService: FsatService,
    private fsatFluidService: FsatFluidService,
    private flueGasCompareService: FlueGasCompareService,) { }

  ngOnInit() {
    this.init();
    this.getResults();
  }

  init() {
    let baseGasDensityDefaults: BaseGasDensity = this.flueGasCompareService.baseGasDensity;
    this.gasDensityForm = this.fsatFluidService.getGasDensityFormFromObj(baseGasDensityDefaults, this.settings);
  }

  disableForm() {
    this.gasDensityForm.controls.gasType.disable();
    this.gasDensityForm.controls.inputType.disable();
  }

  enableForm() {
    this.gasDensityForm.controls.gasType.enable();
    this.gasDensityForm.controls.inputType.enable();
  }

  save() {
    let baseGasDensity: BaseGasDensity = this.fsatFluidService.getGasDensityObjFromForm(this.gasDensityForm);
    this.flueGasCompareService.baseGasDensity = baseGasDensity;
    this.updateFormValidators(baseGasDensity);
  }

  updateFormValidators(baseGasDensity: BaseGasDensity) {
    if (baseGasDensity.inputType == 'dewPoint') {
      let validators: GasDensityValidators = this.fsatFluidService.getValidators(baseGasDensity);
      this.gasDensityForm.controls.dewPoint.setValidators(validators.dewPointValidators);
      this.gasDensityForm.controls.dewPoint.updateValueAndValidity();
    } else if (baseGasDensity.inputType == 'wetBulb') {
      let validators: GasDensityValidators = this.fsatFluidService.getValidators(baseGasDensity);
      this.gasDensityForm.controls.wetBulbTemp.setValidators(validators.wetBulbTempValidators);
      this.gasDensityForm.controls.wetBulbTemp.updateValueAndValidity();
    }
  }

  focusField(str: string) {
    this.flueGasCompareService.currentField.next(str);
  }

  changeGasType() {
    if (this.gasDensityForm.controls.gasType.value === 'OTHER') {
      this.gasDensityForm.patchValue({
        inputType: 'custom'
      });
      this.changeMethod();
    } else {
      this.getResults();
    }
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

    this.flueGasCompareService.setPsychrometricResults(psychrometricResults);
    if (psychrometricResults) {
      this.moistureInCombustionAir = psychrometricResults.humidityRatio * 100;
    } else {
      this.moistureInCombustionAir = 0;
    }
  }

  calcPsychrometricWetBulb(): PsychrometricResults {
    //TODO: Settings using fan units, need to set to proper units
    let psychrometricResults: PsychrometricResults;
    if (this.isWetBulbValid()) {
      let tmpObj: BaseGasDensity = this.fsatFluidService.getGasDensityObjFromForm(this.gasDensityForm);
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
    //TODO: Settings using fan units, need to set to proper units
    let psychrometricResults: PsychrometricResults;
    if (this.isRelativeHumidityValid()) {
      let tmpObj: BaseGasDensity = this.fsatFluidService.getGasDensityObjFromForm(this.gasDensityForm);
      psychrometricResults = this.fsatService.getPsychrometricRelativeHumidity(tmpObj, this.settings);
    }
    return psychrometricResults;
  }

  isRelativeHumidityValid(): boolean {
    //dry bulb
    //static pressure
    //specific gravity
    //relativeHumidity
    return (this.gasDensityForm.controls.dryBulbTemp.valid && this.gasDensityForm.controls.staticPressure.valid && this.gasDensityForm.controls.barometricPressure.valid
      && this.gasDensityForm.controls.specificGravity.valid && this.gasDensityForm.controls.relativeHumidity.valid);
  }


  calcPsychrometricDewPoint(): PsychrometricResults {
    //TODO: Settings using fan units, need to set to proper units
    let psychrometricResults: PsychrometricResults;
    if (this.isDewPointValid()) {
      let tmpObj: BaseGasDensity = this.fsatFluidService.getGasDensityObjFromForm(this.gasDensityForm);
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

  changeMethod() {
    this.gasDensityForm = this.fsatFluidService.updateGasDensityForm(this.gasDensityForm);
    this.getResults();
  }

  hideMoistureModal(action: string) {
    if (action !== 'cancel') {
      this.hideModal.emit(this.moistureInCombustionAir);
    }
    else {
      this.hideModal.emit(undefined);
    }
  }


}
