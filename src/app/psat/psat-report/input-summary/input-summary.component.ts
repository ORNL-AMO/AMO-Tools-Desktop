import { Component, OnInit, Input } from '@angular/core';
import { PSAT } from '../../../shared/models/psat';
import { PsatService } from '../../psat.service';
import { Settings } from '../../../shared/models/settings';
import { ConvertUnitsService } from '../../../shared/convert-units/convert-units.service';
@Component({
  selector: 'app-input-summary',
  templateUrl: './input-summary.component.html',
  styleUrls: ['./input-summary.component.css']
})
export class InputSummaryComponent implements OnInit {
  @Input()
  psat: PSAT;
  @Input()
  settings: Settings;

  pumpDiff: boolean = false;
  pumpRpmDiff: boolean = false;
  driveDiff: boolean = false;
  fluidTypeDiff: boolean = false;
  fluidTemperatureDiff: boolean = false;
  viscosityDiff: boolean = false;
  gravityDiff: boolean = false;
  stagesDiff: boolean = false;
 // fixedDiff: boolean = false;
  freqDiff: boolean = false;
  hpDiff: boolean = false;
  motorRpmDiff: boolean = false;
  effClassDiff: boolean = false;
  motorVoltageDiff: boolean = false;
  flaDiff: boolean = false;
  //marginDiff: boolean = false;
  opFracDiff: boolean = false;
  costDiff: boolean = false;
  flowRateDiff: boolean = false;
  headDiff: boolean = false;
  loadEstDiff: boolean = false;
  ampsDiff: boolean = false;
  kwDiff: boolean = false;
  fieldVoltageDiff: boolean = false;
  anyOptimized: boolean = false;
  constructor(private psatService: PsatService, private convertUnitsService: ConvertUnitsService) { }

  ngOnInit() {
    this.checkInputs();
  }

  getPumpType(num: number) {
    return this.psatService.getPumpStyleFromEnum(num);
  }

  getDrive(num: number) {
    return this.psatService.getDriveFromEnum(num);
  }


  getLineFreq(num: number) {
    return this.psatService.getLineFreqFromEnum(num);
  }

  getEfficiencyClass(num: number) {
    return this.psatService.getEfficiencyClassFromEnum(num);
  }

  getFixedSpeed(num: number) {
    return this.psatService.getFixedSpeedFromEnum(num);
  }

  getLoadMethod(num: number) {
    return this.psatService.getLoadEstimationFromEnum(num);
  }


  getUnit(unit: string){
    let tmpUnit = this.convertUnitsService.getUnit(unit);
    return tmpUnit.unit.name.display;
  }
  checkInputs() {
    if (this.psat.modifications) {
      this.psat.modifications.forEach(mod => {
        if (mod.psat.inputs.pump_style != this.psat.inputs.pump_style) {
          this.pumpDiff = true;
        }
        if (mod.psat.inputs.pump_rated_speed != this.psat.inputs.pump_rated_speed) {
          this.pumpRpmDiff = true;
        }
        if (mod.psat.inputs.drive != this.psat.inputs.drive) {
          this.driveDiff = true;
        }
        if (mod.psat.inputs.fluidType !== this.psat.inputs.fluidType) {
          this.fluidTypeDiff = true;
        }
        if (mod.psat.inputs.fluidTemperature !== this.psat.inputs.fluidTemperature) {
          this.fluidTemperatureDiff = true;
        }
        if (mod.psat.inputs.kinematic_viscosity !== this.psat.inputs.kinematic_viscosity) {
          this.viscosityDiff = true;
        }
        if (mod.psat.inputs.specific_gravity != this.psat.inputs.specific_gravity) {
          this.gravityDiff = true;
        }
        if (mod.psat.inputs.stages != this.psat.inputs.stages) {
          this.stagesDiff = true;
        }
        // if (mod.psat.inputs.fixed_speed != this.psat.inputs.fixed_speed) {
        //   this.fixedDiff = true;
        // }
        if (mod.psat.inputs.line_frequency != this.psat.inputs.line_frequency) {
          this.freqDiff = true;
        }
        if (mod.psat.inputs.motor_rated_power != this.psat.inputs.motor_rated_power) {
          this.hpDiff = true;
        }
        if (mod.psat.inputs.motor_rated_speed != this.psat.inputs.motor_rated_speed) {
          this.motorRpmDiff = true;
        }
        if (mod.psat.inputs.efficiency_class != this.psat.inputs.efficiency_class) {
          this.effClassDiff = true;
        }
        if (mod.psat.inputs.motor_rated_voltage != this.psat.inputs.motor_rated_voltage) {
          this.motorVoltageDiff = true;
        }
        if (mod.psat.inputs.motor_rated_fla != this.psat.inputs.motor_rated_fla) {
          this.flaDiff = true;
        }
        // if (mod.psat.inputs.margin != this.psat.inputs.margin) {
        //   this.marginDiff = true;
        // }
        if (mod.psat.inputs.operating_fraction != this.psat.inputs.operating_fraction) {
          this.opFracDiff = true;
        }
        if (mod.psat.inputs.cost_kw_hour != this.psat.inputs.cost_kw_hour) {
          this.costDiff = true;
        }
        if (mod.psat.inputs.flow_rate != this.psat.inputs.flow_rate) {
          this.flowRateDiff = true;
        }
        if (mod.psat.inputs.head != this.psat.inputs.head) {
          this.headDiff = true;
        }
        if (mod.psat.inputs.load_estimation_method != this.psat.inputs.load_estimation_method) {
          this.loadEstDiff = true;
        }
        if (mod.psat.inputs.motor_field_current != this.psat.inputs.motor_field_current) {
          this.ampsDiff = true;
        }
        // kwDiff
        if (mod.psat.inputs.motor_field_power != this.psat.inputs.motor_field_power) {
          this.kwDiff = true;
        }
        // fieldVoltageDiff
        if (mod.psat.inputs.motor_field_voltage != this.psat.inputs.motor_field_voltage) {
          this.fieldVoltageDiff = true;
        }
        if(mod.psat.inputs.optimize_calculation){
          this.anyOptimized = true;
        }
      })
    }
  }
}

