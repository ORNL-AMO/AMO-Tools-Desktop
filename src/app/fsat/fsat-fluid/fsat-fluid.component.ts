import { Component, OnInit, Input, Output, EventEmitter, SimpleChanges } from '@angular/core';
import { FsatService } from '../fsat.service';
import { FormGroup } from '@angular/forms';
import { FSAT, BaseGasDensity, CalculatedGasDensity } from '../../shared/models/fans';
import { FsatFluidService } from './fsat-fluid.service';
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

  gasDensityForm: FormGroup;

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
    this.getDensity();
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
    this.gasDensityFormService.baselineCalculatedGasDensity.next(undefined);
    this.gasDensityFormService.modificationCalculatedGasDensity.next(undefined);
    this.gasDensityFormService.baselineCalculationType.next(undefined);
    this.gasDensityFormService.modificationCalculationType.next(undefined);
  }

  init() {
    this.gasDensityForm = this.fsatFluidService.getGasDensityFormFromObj(this.baseGasDensity);
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
    this.emitSave.emit(this.baseGasDensity);
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
      this.getDensity();
    }
  }

  getDensity() {
    let calculatedGasDensity: CalculatedGasDensity;
    if (this.gasDensityForm.controls.inputType.value === 'relativeHumidity') {
      calculatedGasDensity = this.calcDensityRelativeHumidity();
    } else if (this.gasDensityForm.controls.inputType.value === 'wetBulb') {
      calculatedGasDensity = this.calcDensityWetBulb();
    } else if (this.gasDensityForm.controls.inputType.value === 'dewPoint') {
      calculatedGasDensity = this.calcDensityDewPoint();
    }

    if (this.gasDensityForm.controls.inputType.value != 'custom') {
      if (calculatedGasDensity && isNaN(calculatedGasDensity.gasDensity) === false) {
        this.gasDensityForm.patchValue({
          gasDensity: calculatedGasDensity.gasDensity
        });
      } else {
        this.gasDensityForm.patchValue({
          gasDensity: undefined
        });
      }
    }

    if (!this.baseline) {
      this.gasDensityFormService.modificationCalculatedGasDensity.next(calculatedGasDensity);
      this.gasDensityFormService.modificationCalculationType.next(this.gasDensityForm.controls.inputType.value);
    } else {
      this.gasDensityFormService.baselineCalculatedGasDensity.next(calculatedGasDensity);
      this.gasDensityFormService.baselineCalculationType.next(this.gasDensityForm.controls.inputType.value);
    }
    this.save();
  }

  calcDensityWetBulb(): CalculatedGasDensity {
    let calculatedGasDensity: CalculatedGasDensity;
    if (this.isWetBulbValid()) {
      let tmpObj: BaseGasDensity = this.fsatFluidService.getGasDensityObjFromForm(this.gasDensityForm);
      calculatedGasDensity = this.fsatService.getBaseGasDensityWetBulb(tmpObj, this.settings);
    }
    return calculatedGasDensity;
  }

  isWetBulbValid(): boolean {
    //dry bulb
    //static pressure
    //specific gravity
    //wet bulb temp
    return (this.gasDensityForm.controls.dryBulbTemp.valid && this.gasDensityForm.controls.staticPressure.valid
      && this.gasDensityForm.controls.specificGravity.valid && this.gasDensityForm.controls.wetBulbTemp.valid);
  }

  calcDensityRelativeHumidity(): CalculatedGasDensity {
    let calculatedGasDensity: CalculatedGasDensity;
    if (this.isRelativeHumidityValid()) {
      let tmpObj: BaseGasDensity = this.fsatFluidService.getGasDensityObjFromForm(this.gasDensityForm);
      calculatedGasDensity = this.fsatService.getBaseGasDensityRelativeHumidity(tmpObj, this.settings);
    }
    return calculatedGasDensity;
  }

  isRelativeHumidityValid(): boolean {
    //dry bulb
    //static pressure
    //specific gravity
    //relativeHumidity
    return (this.gasDensityForm.controls.dryBulbTemp.valid && this.gasDensityForm.controls.staticPressure.valid
      && this.gasDensityForm.controls.specificGravity.valid && this.gasDensityForm.controls.relativeHumidity.valid);
  }


  calcDensityDewPoint(): CalculatedGasDensity {
    let calculatedGasDensity: CalculatedGasDensity;
    if (this.isDewPointValid()) {
      let tmpObj: BaseGasDensity = this.fsatFluidService.getGasDensityObjFromForm(this.gasDensityForm);
      calculatedGasDensity = this.fsatService.getBaseGasDensityDewPoint(tmpObj, this.settings);
    }
    return calculatedGasDensity;
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
    this.getDensity();
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
