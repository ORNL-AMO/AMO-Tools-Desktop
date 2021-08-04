import { Component, OnInit, Input, Output, EventEmitter, SimpleChanges } from '@angular/core';
import { FsatService } from '../../../../fsat/fsat.service';
import { FormGroup } from '@angular/forms';
import { FSAT, BaseGasDensity, PsychrometricResults } from '../../../../shared/models/fans';
import { FsatFluidService, GasDensityValidators } from '../../../../fsat/fsat-fluid/fsat-fluid.service';
import { Settings } from '../../../../shared/models/settings';
import { CompareService } from '../../../../fsat/compare.service';
import { GasDensityFormService } from '../../../../calculator/fans/fan-analysis/fan-analysis-form/gas-density-form/gas-density-form.service';
import { FlueGasCompareService } from '../flue-gas-compare.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-flue-gas-losses-moisture',
  templateUrl: './flue-gas-losses-moisture.component.html',
  styleUrls: ['./flue-gas-losses-moisture.component.css']
})
export class FlueGasLossesMoistureComponent implements OnInit {
  baseGasDensity: BaseGasDensity;
  @Input()
  gasDone: boolean;
  @Output('emitSave')
  emitSave = new EventEmitter<BaseGasDensity>();
  @Input()
  inSetup: boolean;
  @Input()
  selected: boolean;
  @Input()
  modificationIndex: number;
  @Input()
  settings: Settings;
  @Input()
  baseline: boolean;
  @Input()
  fsat: FSAT;
  @Output('hideModal')
  hideModal = new EventEmitter<number>();

  gasDensityForm: FormGroup;

  methods: Array<{ display: string, value: string }> = [
    { display: 'Relative Humidity %', value: 'relativeHumidity' },
    { display: 'Wet Bulb Temperature', value: 'wetBulb' },
    { display: 'Gas Dew Point', value: 'dewPoint' },
  ];

  gasTypes: Array<{ display: string, value: string }> = [
    { display: 'Air', value: 'AIR' },
    { display: 'Other Gas', value: 'OTHER' }
  ];

  idString: string;
  // warnings: FanFluidWarnings;
  constructor(private compareService: CompareService,
    private fsatService: FsatService,
    private fsatFluidService: FsatFluidService,
    private flueGasCompareService: FlueGasCompareService,
    private gasDensityFormService: GasDensityFormService) { }

  ngOnInit() {
    if (!this.baseline) {
      this.idString = 'fsat_modification_' + this.modificationIndex;
    }
    else {
      this.idString = 'fsat_baseline';
    }
    this.baseGasDensity = this.flueGasCompareService.baseGasDensity;
    this.init();
    this.getResults();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.selected && !changes.selected.firstChange) {
      if (this.selected) {
        this.enableForm();
      } else {
        this.disableForm();
      }
    }
    if (changes.modificationIndex && !changes.modificationIndex.firstChange) {
      this.init();
    }
  }

  ngOnDestroy() {
    this.gasDensityFormService.baselinePsychrometricResults.next(undefined);
    this.gasDensityFormService.modificationPsychrometricResults.next(undefined);
    this.gasDensityFormService.baselineCalculationType.next(undefined);
    this.gasDensityFormService.modificationCalculationType.next(undefined);
  }

  init() {
    this.gasDensityForm = this.fsatFluidService.getGasDensityFormFromObj(this.baseGasDensity, this.settings);
  }

  disableForm() {
    this.gasDensityForm.controls.gasType.disable();
    this.gasDensityForm.controls.inputType.disable();
    // this.chargeMaterialForm.disable();
  }

  enableForm() {
    this.gasDensityForm.controls.gasType.enable();
    this.gasDensityForm.controls.inputType.enable();
    // this.chargeMaterialForm.enable();
  }

  save() {
    //save is always called on input so add check for warnings call here
    this.baseGasDensity = this.fsatFluidService.getGasDensityObjFromForm(this.gasDensityForm);
    this.flueGasCompareService.setCurrentDensity(this.baseGasDensity);
    this.updateFormValidators();
    this.emitSave.emit(this.baseGasDensity);
  }

  updateFormValidators(){
    if(this.baseGasDensity.inputType == 'dewPoint'){
      let validators: GasDensityValidators = this.fsatFluidService.getValidators(this.baseGasDensity);
      this.gasDensityForm.controls.dewPoint.setValidators(validators.dewPointValidators);
      this.gasDensityForm.controls.dewPoint.updateValueAndValidity();
    }else if(this.baseGasDensity.inputType == 'wetBulb'){
      let validators: GasDensityValidators = this.fsatFluidService.getValidators(this.baseGasDensity);
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

  getResults(): PsychrometricResults {
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

    if (!this.baseline) {
      this.gasDensityFormService.modificationPsychrometricResults.next(psychrometricResults);
      this.gasDensityFormService.modificationCalculationType.next(this.gasDensityForm.controls.inputType.value);
    } else {
      this.gasDensityFormService.baselinePsychrometricResults.next(psychrometricResults);
      this.gasDensityFormService.baselineCalculationType.next(this.gasDensityForm.controls.inputType.value);
    }
    this.save();
    this.flueGasCompareService.setPsychrometricResults(psychrometricResults);
    return psychrometricResults;
  }

  calcPsychrometricWetBulb(): PsychrometricResults {
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
    return (this.gasDensityForm.controls.dryBulbTemp.valid && this.gasDensityForm.controls.staticPressure.valid
      && this.gasDensityForm.controls.specificGravity.valid && this.gasDensityForm.controls.relativeHumidity.valid);
  }


  calcPsychrometricDewPoint(): PsychrometricResults {
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

  canCompare() {
    if (this.compareService.baselineFSAT && this.compareService.modifiedFSAT && !this.inSetup) {
      return true;
    } else {
      return false;
    }
  }

  isDryBulbTempDifferent() {
    if (this.canCompare()) {
      return this.compareService.isDryBulbTempDifferent();
    } else {
      return false;
    }
  }
  isStaticPressureDifferent() {
    if (this.canCompare()) {
      return this.compareService.isStaticPressureDifferent();
    } else {
      return false;
    }
  }
  isBarometricPressureDifferent() {
    if (this.canCompare()) {
      return this.compareService.isBarometricPressureDifferent();
    } else {
      return false;
    }
  }
  isGasDensityDifferent() {
    if (this.canCompare()) {
      return this.compareService.isGasDensityDifferent();
    } else {
      return false;
    }
  }
  isGasTypeDifferent() {
    if (this.canCompare()) {
      return this.compareService.isGasTypeDifferent();
    } else {
      return false;
    }
  }
  // isConditionLocationDifferent() {
  //   if (this.canCompare()) {
  //     return this.compareService.isConditionLocationDifferent();
  //   } else {
  //     return false;
  //   }
  // }
  isSpecificGravityDifferent() {
    if (this.canCompare()) {
      return this.compareService.isSpecificGravityDifferent();
    } else {
      return false;
    }
  }
  isInputTypeDifferent() {
    if (this.canCompare()) {
      return this.compareService.isInputTypeDifferent();
    } else {
      return false;
    }
  }
  isSpecificHeatRatioDifferent() {
    if (this.canCompare()) {
      return this.compareService.isSpecificHeatRatioDifferent();
    } else {
      return false;
    }
  }
  isDewPointDifferent() {
    if (this.canCompare()) {
      return this.compareService.isDewPointDifferent();
    } else {
      return false;
    }
  }
  isRelativeHumidityDifferent() {
    if (this.canCompare()) {
      return this.compareService.isRelativeHumidityDifferent();
    } else {
      return false;
    }
  }
  isWetBulbTempDifferent() {
    if (this.canCompare()) {
      return this.compareService.isWetBulbTempDifferent();
    } else {
      return false;
    }
  }

  
  hideMoistureModal(action: string) {
    if (action !== 'cancel') {
    this.hideModal.emit(this.getResults().humidityRatio * 100);
    }
    else {
    this.hideModal.emit(-150);
    }
  }


}
