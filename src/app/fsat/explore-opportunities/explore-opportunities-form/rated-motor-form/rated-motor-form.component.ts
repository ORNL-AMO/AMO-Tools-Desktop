import { Component, OnInit, Input, Output, EventEmitter, SimpleChanges } from '@angular/core';
import { Settings } from '../../../../shared/models/settings';
import { FSAT } from '../../../../shared/models/fans';
import { ConvertUnitsService } from '../../../../shared/convert-units/convert-units.service';
import { HelpPanelService } from '../../../help-panel/help-panel.service';
import { ModifyConditionsService } from '../../../modify-conditions/modify-conditions.service';
import { FsatWarningService, FanMotorWarnings } from '../../../fsat-warning.service';
import { PsatService } from '../../../../psat/psat.service';
import { FormGroup, ValidatorFn } from '@angular/forms';
import { FanMotorService } from '../../../fan-motor/fan-motor.service';
import { motorEfficiencyConstants } from '../../../../psat/psatConstants';

@Component({
  selector: 'app-rated-motor-form',
  templateUrl: './rated-motor-form.component.html',
  styleUrls: ['./rated-motor-form.component.css']
})
export class RatedMotorFormComponent implements OnInit {
  @Input()
  fsat: FSAT;
  @Input()
  settings: Settings;
  @Input()
  exploreModIndex: number;
  @Output('emitCalculate')
  emitCalculate = new EventEmitter<boolean>();

  //showRatedMotorPower: boolean = false;
  showEfficiencyClass: boolean = false;
  // showRatedMotorData: boolean = false;
  showMotorEfficiency: boolean = false;
  // showFLA: boolean = false;
  // baselineWarnings: FanMotorWarnings;
  // modificationWarnings: FanMotorWarnings;
  // options: Array<any>;
  // options2: Array<any>;
  // horsePowers: Array<number> = [5, 7.5, 10, 15, 20, 25, 30, 40, 50, 60, 75, 100, 125, 150, 200, 250, 300, 350, 400, 450, 500, 600, 700, 800, 900, 1000, 1250, 1750, 2000, 2250, 2500, 3000, 3500, 4000, 4500, 5000, 5500, 6000, 7000, 8000, 9000, 10000, 11000, 12000, 13000, 14000, 15000, 16000, 17000, 18000, 19000, 20000, 22500, 25000, 27500, 30000, 35000, 40000, 45000, 50000];
  // horsePowersPremium: Array<number> = [5, 7.5, 10, 15, 20, 25, 30, 40, 50, 60, 75, 100, 125, 150, 200, 250, 300, 350, 400, 450, 500];
  // kWatts: Array<number> = [3, 3.7, 4, 4.5, 5.5, 6, 7.5, 9.2, 11, 13, 15, 18.5, 22, 26, 30, 37, 45, 55, 75, 90, 110, 132, 150, 160, 185, 200, 225, 250, 280, 300, 315, 335, 355, 400, 450, 500, 560, 630, 710, 800, 900, 1000, 1250, 1500, 1750, 2000, 2250, 2500, 3000, 3500, 4000, 4500, 5000, 5500, 6000, 7000, 8000, 9000, 10000, 11000, 12000, 13000, 14000, 15000, 16000, 17000, 18000, 19000, 20000, 22500, 25000, 27500, 30000, 35000, 40000];
  // kWattsPremium: Array<number> = [3, 3.7, 4, 4.5, 5.5, 6, 7.5, 9.2, 11, 13, 15, 18.5, 22, 26, 30, 37, 45, 55, 75, 90, 110, 132, 150, 160, 185, 200, 225, 250, 280, 300, 315, 335, 355];
  baselineForm: FormGroup;
  modificationForm: FormGroup;
  efficiencyClasses: Array<{ value: number, display: string }>
  constructor(
    private fsatWarningService: FsatWarningService,
    private convertUnitsService: ConvertUnitsService,
    private psatService: PsatService,
    private helpPanelService: HelpPanelService,
    private modifyConditionsService: ModifyConditionsService,
    private fanMotorService: FanMotorService) { }

  ngOnInit() {
    this.efficiencyClasses = motorEfficiencyConstants;
    this.init();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.exploreModIndex) {
      if (!changes.exploreModIndex.isFirstChange()) {
        this.init()
      }
    }
  }

  init() {
    this.baselineForm = this.fanMotorService.getFormFromObj(this.fsat.fanMotor);
    this.baselineForm.disable();
    this.modificationForm = this.fanMotorService.getFormFromObj(this.fsat.modifications[this.exploreModIndex].fsat.fanMotor);
    this.initEfficiencyClass();
    this.initMotorEfficiency();
    //this.initRatedMotorPower();
    //this.initFLA();
    //this.initRatedMotorData();
    //this.checkWarnings();
  }

  initEfficiencyClass() {
    if (this.baselineForm.controls.efficiencyClass.value != this.modificationForm.controls.efficiencyClass.value) {
      this.showEfficiencyClass = true;
    } else {
      this.showEfficiencyClass = false;
    }
  }

  initMotorEfficiency() {
    if (this.modificationForm.controls.efficiencyClass.value == 3) {
      this.showMotorEfficiency = true;
      this.modificationForm.controls.specifiedEfficiency.enable();
    } else {
      this.modificationForm.controls.specifiedEfficiency.patchValue(90);
      this.modificationForm.controls.specifiedEfficiency.disable();
    }
    if (this.baselineForm.controls.efficiencyClass.value == 3) {
      this.showMotorEfficiency = true;
    } else {
      this.baselineForm.controls.specifiedEfficiency.patchValue(90);
    }

    if (this.baselineForm.controls.efficiencyClass.value != 3 && this.modificationForm.controls.efficiencyClass.value != 3) {
      this.showMotorEfficiency = false;
    }
  }

  // initRatedMotorPower() {
  //   if (this.baselineForm.controls.motorRatedPower.value != this.modificationForm.controls.motorRatedPower.value) {
  //     this.showRatedMotorPower = true;
  //   } else {
  //     this.showRatedMotorPower = false;
  //   }
  // }

  // initFLA() {
  //   if (this.baselineForm.controls.fullLoadAmps.value != this.modificationForm.controls.fullLoadAmps.value) {
  //     this.showFLA = true;
  //   } else {
  //     this.showFLA = false;
  //   }
  // }

  // initRatedMotorData() {
  //   if (this.showEfficiencyClass || this.showMotorEfficiency) {
  //     this.showRatedMotorData = true;
  //   } else {
  //     this.showRatedMotorData = false;
  //   }
  // }

  calculate() {
    this.fsat.modifications[this.exploreModIndex].fsat.fanMotor = this.fanMotorService.getObjFromForm(this.modificationForm);
    //this.checkWarnings();
    this.emitCalculate.emit(true);
  }

  focusField(str: string) {
    this.helpPanelService.currentField.next(str);
    this.modifyConditionsService.modifyConditionsTab.next('fan-motor')
  }

  getUnit(unit: string) {
    let tmpUnit = this.convertUnitsService.getUnit(unit);
    let dsp = tmpUnit.unit.name.display.replace('(', '');
    dsp = dsp.replace(')', '');
    return dsp;

  }

  setEfficiencyClasses() {
    this.initMotorEfficiency();
    let tmpEfficiencyValidators: Array<ValidatorFn> = this.fanMotorService.getEfficiencyValidators(this.modificationForm.controls.efficiencyClass.value);
    this.modificationForm.controls.efficiencyClass.setValidators(tmpEfficiencyValidators);
    this.modificationForm.controls.efficiencyClass.reset(this.modificationForm.controls.efficiencyClass.value);
    this.modificationForm.controls.efficiencyClass.markAsDirty();

    tmpEfficiencyValidators = this.fanMotorService.getEfficiencyValidators(this.baselineForm.controls.efficiencyClass.value);
    this.baselineForm.controls.efficiencyClass.setValidators(tmpEfficiencyValidators);
    this.baselineForm.controls.efficiencyClass.reset(this.baselineForm.controls.efficiencyClass.value);
    this.baselineForm.controls.efficiencyClass.markAsDirty();
    this.calculate();
  }

  // checkWarnings() {
  //   this.baselineWarnings = this.fsatWarningService.checkMotorWarnings(this.fsat, this.settings);
  //   this.modificationWarnings = this.fsatWarningService.checkMotorWarnings(this.fsat.modifications[this.exploreModIndex].fsat, this.settings);
  // }

  // toggleRatedMotorData() {
  //   if (this.showRatedMotorData == false) {
  //     // this.showRatedMotorPower = false;
  //     this.showEfficiencyClass = false;
  //     this.showMotorEfficiency = false;
  //     this.toggleMotorEfficiency();
  //     this.toggleEfficiencyClass();
  //     //    this.toggleMotorRatedPower();
  //     //this.toggleFLA();
  //   }
  // }
  // toggleMotorRatedPower() {
  //   if (this.showRatedMotorPower == false) {
  //     this.modificationForm.controls.motorRatedPower.patchValue(this.baselineForm.controls.motorRatedPower.value);
  //     this.calculate();
  //   }
  // }
  toggleEfficiencyClass() {
    if (this.showEfficiencyClass == false) {
      this.modificationForm.controls.efficiencyClass.patchValue(this.baselineForm.controls.efficiencyClass.value);
      // this.modifyPowerArrays(false);
      this.calculate();
    }
  }
  toggleMotorEfficiency() {
    if (this.showMotorEfficiency == false) {
      this.modificationForm.controls.specifiedEfficiency.patchValue(this.baselineForm.controls.specifiedEfficiency.value);
      this.calculate();
    }
  }

  // toggleFLA() {
  //   if (this.showFLA == false) {
  //     this.modificationForm.controls.fullLoadAmps.patchValue(this.baselineForm.controls.fullLoadAmps.value);
  //     this.calculate();
  //   }
  // }

  disableModifiedFLA() {
    if (
      this.modificationForm.controls.motorRatedPower.valid &&
      this.modificationForm.controls.motorRpm.valid &&
      this.modificationForm.controls.lineFrequency.valid &&
      this.modificationForm.controls.efficiencyClass.valid &&
      this.modificationForm.controls.motorRatedVoltage.valid
    ) {
      return false;
    } else {
      return true;
    }
  }

  getModificationFLA() {
    if (
      !this.disableModifiedFLA()
    ) {
      if (!this.modificationForm.controls.specifiedEfficiency.value) {
        this.modificationForm.controls.specifiedEfficiency.patchValue(90);
      }
      let estEfficiency = this.psatService.estFLA(
        this.modificationForm.controls.motorRatedPower.value,
        this.modificationForm.controls.motorRpm.value,
        this.modificationForm.controls.lineFrequency.value,
        this.modificationForm.controls.efficiencyClass.value,
        this.modificationForm.controls.specifiedEfficiency.value,
        this.modificationForm.controls.motorRatedVoltage.value,
        this.settings
      );
      this.modificationForm.controls.fullLoadAmps.patchValue(estEfficiency);
    }
    this.calculate();
  }
}
