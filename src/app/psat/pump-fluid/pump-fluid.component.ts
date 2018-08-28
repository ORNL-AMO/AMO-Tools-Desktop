import { Component, OnInit, Output, EventEmitter, Input, SimpleChanges } from '@angular/core';
import { PsatService } from '../psat.service';
import { PSAT } from '../../shared/models/psat';
import { Settings } from '../../shared/models/settings';
import { CompareService } from '../compare.service';
import { HelpPanelService } from '../help-panel/help-panel.service';
import { ConvertUnitsService } from '../../shared/convert-units/convert-units.service';
import { FormGroup } from '@angular/forms';
import { pumpTypes, drives, fluidProperties, fluidTypes } from '../psatConstants';
import { PsatWarningService } from '../psat-warning.service';

@Component({
  selector: 'app-pump-fluid',
  templateUrl: './pump-fluid.component.html',
  styleUrls: ['./pump-fluid.component.css']
})
export class PumpFluidComponent implements OnInit {
  @Input()
  psat: PSAT;
  @Output('saved')
  saved = new EventEmitter<boolean>();
  @Output('isValid')
  isValid = new EventEmitter<boolean>();
  @Output('isInvalid')
  isInvalid = new EventEmitter<boolean>();
  @Input()
  selected: boolean;
  @Input()
  settings: Settings;
  @Input()
  baseline: boolean;
  @Input()
  inSetup: boolean;
  @Input()
  modificationIndex: number;

  formValid: boolean;
  pumpTypes: Array<string>;
  drives: Array<string>;
  fluidProperties;
  fluidTypes: Array<string>;
  psatForm: FormGroup;
  isFirstChange: boolean = true;
  rpmError: string = null;
  temperatureError: string = null;
  pumpEfficiencyError: string = null;
  tempUnit: string;
  constructor(private psatService: PsatService, private psatWarningService: PsatWarningService, private compareService: CompareService, private helpPanelService: HelpPanelService, private convertUnitsService: ConvertUnitsService) { }

  ngOnChanges(changes: SimpleChanges) {
    if (!this.isFirstChange) {
      if (!this.selected) {
        this.disableForm();
      } else {
        this.enableForm();
      }
      if (changes.modificationIndex) {
        this.init();
      }
    }
    else {
      this.isFirstChange = false;
    }
  }

  ngOnInit() {
    this.pumpTypes = pumpTypes;
    this.drives = drives;
    this.fluidProperties = fluidProperties;
    this.fluidTypes = fluidTypes;

    this.init();
    if (this.settings.temperatureMeasurement == 'C') {
      this.tempUnit = '&#8451;';
    } else if (this.settings.temperatureMeasurement == 'F') {
      this.tempUnit = '&#8457;';
    } else if (this.settings.temperatureMeasurement == 'K') {
      this.tempUnit = '&#8490;';
    } else if (this.settings.temperatureMeasurement == 'R') {
      this.tempUnit = '&#176;R';
    }
    if (!this.selected) {
      this.disableForm();
    }
  }

  init() {
    this.psatForm = this.psatService.getFormFromPsat(this.psat.inputs);
    this.checkForm(this.psatForm);
    this.checkWarnings();
  }

  disableForm() {
    this.psatForm.controls.pumpType.disable();
    this.psatForm.controls.drive.disable();
    this.psatForm.controls.fluidType.disable();
  }

  enableForm() {
    this.psatForm.controls.pumpType.enable();
    this.psatForm.controls.drive.enable();
    this.psatForm.controls.fluidType.enable();
  }

  addNum(str: string) {
    if (str == 'stages') {
      this.psatForm.patchValue({
        stages: this.psatForm.controls.stages.value + 1
      })
    }
    this.save();
  }

  subtractNum(str: string) {
    if (str == 'stages') {
      if (this.psatForm.controls.stages.value != 0) {
        this.psatForm.patchValue({
          stages: this.psatForm.controls.stages.value - 1
        })
      }
    }
    this.save();
  }

  focusField(str: string) {
    this.helpPanelService.currentField.next(str);
    this.checkForm(this.psatForm);
  }

  checkForm(form: FormGroup) {
    this.formValid = this.psatService.isPumpFluidFormValid(form);
    if (this.formValid) {
      this.isValid.emit(true)
    } else {
      this.isInvalid.emit(true)
    }
  }

  calculateSpecificGravity() {
    let fluidType = this.psatForm.controls.fluidType.value;
    let t = this.psatForm.controls.fluidTemperature.value;
    t = this.convertUnitsService.value(t).from(this.settings.temperatureMeasurement).to('F');
    if (fluidType && t) {

      if (fluidType === 'Other') {
        return;
      }
      if (fluidType === 'Water') {
        let tTemp = (t - 32) * (5.0 / 9) + 273.15;
        let density = 0.14395 / Math.pow(0.0112, (1 + Math.pow(1 - tTemp / 649.727, 0.05107)));
        let kinViscosity = 0.000000003 * Math.pow(t, 4) - 0.000002 * Math.pow(t, 3) + 0.0005 * Math.pow(t, 2) - 0.0554 * t + 3.1271;
        this.psatForm.patchValue({
          gravity: this.psatService.roundVal((density / 1000), 3),
          viscosity: this.psatService.roundVal(kinViscosity, 3)
        });
      } else {
        let property = this.fluidProperties[fluidType];
        let density = property.density / (1 + property.beta * (t - property.tref));
        this.psatForm.patchValue({
          gravity: this.psatService.roundVal((density / 62.428), 3),
          viscosity: this.psatService.roundVal(property.kinViscosity, 3)
        });
      }
    }
    this.save();
  }


  save() {
    this.checkForm(this.psatForm);
    this.psat.inputs = this.psatService.getPsatInputsFromForm(this.psatForm);
    this.checkWarnings();
    this.saved.emit(this.selected);
  }

  checkWarnings() {
    let tmpWarnings:  { rpmError: string, temperatureError: string, pumpEfficiencyError: string } = this.psatWarningService.checkPumpFluidWarnings(this.psat, this.settings);
    this.rpmError = tmpWarnings.rpmError;
    this.temperatureError = tmpWarnings.temperatureError;
    this.pumpEfficiencyError = tmpWarnings.pumpEfficiencyError;
  }

  canCompare() {
    if (this.compareService.baselinePSAT && this.compareService.modifiedPSAT && !this.inSetup) {
      return true;
    } else {
      return false;
    }
  }

  isPumpSpecifiedDifferent() {
    if (this.canCompare()) {
      return this.compareService.isPumpSpecifiedDifferent();
    } else {
      return false;
    }
  }
  isPumpStyleDifferent() {
    if (this.canCompare()) {
      return this.compareService.isPumpStyleDifferent();
    } else {
      return false;
    }
  }
  isPumpRpmDifferent() {
    if (this.canCompare()) {
      return this.compareService.isPumpRpmDifferent();
    } else {
      return false;
    }
  }
  isDriveDifferent() {
    if (this.canCompare()) {
      return this.compareService.isDriveDifferent();
    } else {
      return false;
    }
  }
  isKinematicViscosityDifferent() {
    if (this.canCompare()) {
      return this.compareService.isKinematicViscosityDifferent();
    } else {
      return false;
    }
  }
  isSpecificGravityDifferent() {
    if (this.canCompare()) {
      return this.compareService.isSpecificGravityDifferent();
    } else {
      return false;
    }
  }
  isFluidTempDifferent() {
    if (this.canCompare()) {
      return this.compareService.isFluidTempDifferent();
    } else {
      return false;
    }
  }
  isFluidTypeDifferent() {
    if (this.canCompare()) {
      return this.compareService.isFluidTypeDifferent();
    } else {
      return false;
    }
  }

  isStagesDifferent() {
    if (this.canCompare()) {
      return this.compareService.isStagesDifferent();
    } else {
      return false;
    }
  }

  isSpecifiedEfficiencyDifferent(){
    if (this.canCompare()) {
      return this.compareService.isSpecifiedEfficiencyDifferent();
    } else {
      return false;
    }
  }
}
