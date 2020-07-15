import { Component, OnInit } from '@angular/core';
import { SuiteDbService } from '../../../../../suiteDb/suite-db.service';
import { SuiteDbMotor } from '../../../../../shared/models/materials';
import * as _ from 'lodash';
import { FilterMotorOptions } from '../filter-motor-options.pipe';
import { MotorCatalogService } from '../../motor-catalog.service';

@Component({
  selector: 'app-filter-motors',
  templateUrl: './filter-motors.component.html',
  styleUrls: ['./filter-motors.component.css']
})
export class FilterMotorsComponent implements OnInit {


  efficiencyClassOptions: Array<number>;
  lineFrequenciesOptions: Array<number> = [60, 50];
  enclosureTypeOptions: Array<string>;
  efficiencyMin: number;
  efficiencyMax: number;
  polesOptions: Array<number>;
  voltageLimitMin: number;
  voltageLimitMax: number;
  motorPowerMin: number;
  motorPowerMax: number;
  synchSpeedMin: number;
  synchSpeedMax: number;

  filterMotorOptions: FilterMotorOptions;
  constructor(private suiteDbService: SuiteDbService, private motorCatalogService: MotorCatalogService) { }

  ngOnInit(): void {
    let motorOptions: Array<SuiteDbMotor> = this.suiteDbService.selectMotors();

    let uniqMotorsByType = _.uniqBy(motorOptions, 'motorType');
    this.enclosureTypeOptions = _.map(uniqMotorsByType, (motor) => { return motor.enclosureType });

    let uniqEfficiencyClass = _.uniqBy(motorOptions, 'efficiencyType');
    this.efficiencyClassOptions = _.map(uniqEfficiencyClass, (motor) => { return motor.efficiencyClass });

    this.efficiencyMin = Math.floor(_.minBy(motorOptions, 'nominalEfficiency').nominalEfficiency);
    this.efficiencyMax = Math.ceil(_.maxBy(motorOptions, 'nominalEfficiency').nominalEfficiency);

    this.voltageLimitMax = _.maxBy(motorOptions, 'nominalEfficiency').voltageLimit;
    this.voltageLimitMin = _.minBy(motorOptions, 'nominalEfficiency').voltageLimit;

    this.motorPowerMax = _.maxBy(motorOptions, 'nominalEfficiency').hp;
    this.motorPowerMin = _.minBy(motorOptions, 'nominalEfficiency').hp;

    this.synchSpeedMax = _.maxBy(motorOptions, 'nominalEfficiency').synchronousSpeed;
    this.synchSpeedMin = _.minBy(motorOptions, 'nominalEfficiency').synchronousSpeed;

    let uniqPoles = _.uniqBy(motorOptions, 'poles');
    this.polesOptions = _.map(uniqPoles, (motor) => { return motor.poles });

    this.filterMotorOptions = this.motorCatalogService.filterMotorOptions.getValue();
    if (this.filterMotorOptions == undefined) {
      this.initFilterMotorOptions();
    }
  }

  initFilterMotorOptions() {
    this.filterMotorOptions = {
      enclosureTypes: [],
      efficiencyClass: [],
      lineFrequencies: [],
      efficiencyMin: this.efficiencyMin,
      efficiencyMax: this.efficiencyMax,
      poles: [],
      voltageLimitMin: this.voltageLimitMin,
      voltageLimitMax: this.voltageLimitMax,
      syncSpeedMin: this.synchSpeedMin,
      syncSpeedMax: this.synchSpeedMax,
      motorPowerMin: this.motorPowerMin,
      motorPowerMax: this.motorPowerMax
    }
    this.save();
  }

  save(){
    this.motorCatalogService.filterMotorOptions.next(this.filterMotorOptions);
  }
}
