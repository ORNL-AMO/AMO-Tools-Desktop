import { Component, OnInit, Output, EventEmitter, Input, SimpleChanges, ChangeDetectorRef } from '@angular/core';
import { PsatService } from '../psat.service';
import { PSAT, PsatInputs } from '../../shared/models/psat';
import { Settings } from '../../shared/models/settings';
import { CompareService } from '../compare.service';
import { HelpPanelService } from '../help-panel/help-panel.service';
import { ConvertUnitsService } from '../../shared/convert-units/convert-units.service';
import { UntypedFormGroup, ValidatorFn } from '@angular/forms';
import { pumpTypesConstant, driveConstants, fluidProperties, fluidTypes } from '../psatConstants';
import { PsatWarningService } from '../psat-warning.service';
import { PumpFluidService } from './pump-fluid.service';
import { IntegrationStateService } from '../../shared/assessment-integration/integration-state.service';

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
  @Input()
  psatInputs: PsatInputs;
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
  hasConnectedInventories: boolean;

  //Arrays holding <select> form data
  pumpTypes: Array<{ display: string, value: number }>;
  drives: Array<{ display: string, value: number }>;
  //TODO: create Fluid Property interface
  fluidProperties;
  fluidTypes: Array<string>;

  psatForm: UntypedFormGroup;
  idString: string;
  pumpFluidWarnings: { rpmError: string, temperatureError: string };
  constructor(private psatService: PsatService, 
              private psatWarningService: PsatWarningService, 
              private compareService: CompareService, 
              private helpPanelService: HelpPanelService, 
              private integrationStateService: IntegrationStateService,
              private convertUnitsService: ConvertUnitsService, 
              private pumpFluidService: PumpFluidService) { }

  ngOnInit() {
    if (!this.baseline) {
      this.idString = 'psat_modification_' + this.modificationIndex;
    }
    else {
      this.idString = 'psat_baseline';
    }
    this.pumpTypes = JSON.parse(JSON.stringify(pumpTypesConstant));
    this.pumpTypes.pop();
    //initialize constants
    this.drives = JSON.parse(JSON.stringify(driveConstants));
    this.fluidProperties = JSON.parse(JSON.stringify(fluidProperties));
    this.fluidTypes = JSON.parse(JSON.stringify(fluidTypes));

    this.initForm();
    if (!this.selected) {
      this.disableForm();
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.selected && !changes.selected.isFirstChange()) {
      if (!this.selected) {
        this.disableForm();
      } else {
        this.enableForm();
      }
    }
    if (changes.modificationIndex && !changes.modificationIndex.isFirstChange() ||
      changes.psat && !changes.psat.isFirstChange()) {
      this.initForm();
    }
  }

  initForm() {
    this.hasConnectedInventories = this.integrationStateService.assessmentIntegrationState.getValue().hasThreeWayConnection;
    this.psatForm = this.pumpFluidService.getFormFromObj(this.psat.inputs);
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
  }

  enablePumpType() {
    this.psatForm.controls.pumpType.patchValue(this.compareService.baselinePSAT.inputs.pump_style);
    // this.psatForm.controls.pumpType.enable();
    this.getPumpEfficiency();
  }

  disablePumpType() {
    let baselinePumpEfficiency: number = this.psatService.resultsExisting(this.compareService.baselinePSAT.inputs, this.settings).pump_efficiency;
    this.psatForm.controls.specifiedPumpEfficiency.patchValue(baselinePumpEfficiency);
    this.psatForm.controls.pumpType.patchValue(11);
    this.save();
  }


  getPumpEfficiency() {
    let tmpEfficiency: number = this.psatService.pumpEfficiency(this.psatForm.controls.pumpType.value, this.psat.inputs.flow_rate, this.settings).max;
    this.psatForm.controls.specifiedPumpEfficiency.patchValue(tmpEfficiency);
    this.save();
  }


  calculateSpecificGravity() {
    let fluidType = this.psatForm.controls.fluidType.value;
    let t = this.psatForm.controls.fluidTemperature.value;
    t = this.convertUnitsService.value(t).from(this.settings.temperatureMeasurement).to('F');
    if (fluidType && t) {

      if (fluidType === 'Other') {
        this.save();
      } else if (fluidType === 'Water') {
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

  changePumpType() {
    let specifiedPumpEfficiencyValidators: Array<ValidatorFn> = this.pumpFluidService.getSpecifiedPumpEfficiencyValidators(this.psatForm.controls.pumpType.value);
    this.psatForm.controls.specifiedPumpEfficiency.setValidators(specifiedPumpEfficiencyValidators);
    this.psatForm.controls.specifiedPumpEfficiency.reset(this.psatForm.controls.specifiedPumpEfficiency.value);
    this.psatForm.controls.specifiedPumpEfficiency.markAsDirty();
    if (!this.baseline) {
      this.getPumpEfficiency();
    }
    this.save();
  }

  changeDriveType() {
    let specifiedDriveEfficiencyValidators: Array<ValidatorFn> = this.pumpFluidService.getSpecifiedDriveEfficiency(this.psatForm.controls.drive.value);
    this.psatForm.controls.specifiedDriveEfficiency.setValidators(specifiedDriveEfficiencyValidators);
    this.psatForm.controls.specifiedDriveEfficiency.reset(this.psatForm.controls.specifiedDriveEfficiency.value);
    this.psatForm.controls.specifiedDriveEfficiency.markAsDirty();
    this.save();
  }


  save() {
    //update object values from form values
    this.psat.inputs = this.pumpFluidService.getPsatInputsFromForm(this.psatForm, this.psat.inputs);
    //check warnings
    this.checkWarnings();
    //save
    this.saved.emit(this.selected);
  }


  checkWarnings() {
    this.pumpFluidWarnings = this.psatWarningService.checkPumpFluidWarnings(this.psat, this.settings);
  }

  canCompare() {
    if (this.compareService.baselinePSAT && this.compareService.modifiedPSAT && !this.inSetup) {
      return true;
    } else {
      return false;
    }
  }

  isPumpTypeDifferent() {
    if (this.canCompare()) {
      return this.compareService.isPumpTypeDifferent();
    } else {
      return false;
    }
  }

  isPumpSpecifiedDifferent() {
    if (this.canCompare()) {
      return this.compareService.isPumpSpecifiedDifferent(this.settings);
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
  isSpecifiedDriveEfficiencyDifferent() {
    if (this.canCompare()) {
      return this.compareService.isSpecifiedDriveEfficiencyDifferent();
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

  isSpecifiedEfficiencyDifferent() {
    if (this.canCompare()) {
      return this.compareService.isSpecifiedEfficiencyDifferent();
    } else {
      return false;
    }
  }
}
