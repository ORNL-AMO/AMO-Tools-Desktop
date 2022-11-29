import { Component, OnInit, Input, Output, EventEmitter, SimpleChanges } from '@angular/core';
import { FsatService } from '../fsat.service';
import { UntypedFormGroup } from '@angular/forms';
import { FSAT, BaseGasDensity, PsychrometricResults } from '../../shared/models/fans';
import { FsatFluidService, GasDensityValidators } from './fsat-fluid.service';
import { Settings } from '../../shared/models/settings';
import { HelpPanelService } from '../help-panel/help-panel.service';
import { CompareService } from '../compare.service';
import { GasDensityFormService } from '../../calculator/fans/fan-analysis/fan-analysis-form/gas-density-form/gas-density-form.service';

@Component({
  selector: 'app-fsat-fluid',
  templateUrl: './fsat-fluid.component.html',
  styleUrls: ['./fsat-fluid.component.css']
})
export class FsatFluidComponent implements OnInit {
  @Input()
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

  gasDensityForm: UntypedFormGroup;

  methods: Array<{ display: string, value: string }> = [
    { display: 'Relative Humidity %', value: 'relativeHumidity' },
    { display: 'Wet Bulb Temperature', value: 'wetBulb' },
    { display: 'Gas Dew Point', value: 'dewPoint' },
    { display: 'Use Known Density', value: 'custom' },
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
    private helpPanelService: HelpPanelService,
    private gasDensityFormService: GasDensityFormService) { }

  ngOnInit() {
    if (!this.baseline) {
      this.idString = 'fsat_modification_' + this.modificationIndex;
    }
    else {
      this.idString = 'fsat_baseline';
    }
    this.init();
    if (!this.selected) {
      this.disableForm();
    }
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
    this.helpPanelService.currentField.next(str);
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

    if (!this.baseline) {
      this.gasDensityFormService.modificationPsychrometricResults.next(psychrometricResults);
      this.gasDensityFormService.modificationCalculationType.next(this.gasDensityForm.controls.inputType.value);
    } else {
      this.gasDensityFormService.baselinePsychrometricResults.next(psychrometricResults);
      this.gasDensityFormService.baselineCalculationType.next(this.gasDensityForm.controls.inputType.value);
    }
    this.save();
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


}
