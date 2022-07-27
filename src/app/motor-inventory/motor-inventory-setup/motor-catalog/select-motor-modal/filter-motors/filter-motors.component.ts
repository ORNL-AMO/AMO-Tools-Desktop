import { Component, OnInit } from '@angular/core';
import { SuiteDbMotor } from '../../../../../shared/models/materials';
import * as _ from 'lodash';
import { FilterMotorOptions } from '../filter-motor-options.pipe';
import { MotorCatalogService } from '../../motor-catalog.service';
import { SqlDbApiService } from '../../../../../tools-suite-api/sql-db-api.service';

@Component({
  selector: 'app-filter-motors',
  templateUrl: './filter-motors.component.html',
  styleUrls: ['./filter-motors.component.css']
})
export class FilterMotorsComponent implements OnInit {


  efficiencyClassOptions: Array<number>;
  lineFrequencyOptions: Array<number> = [60, 50];
  enclosureTypeOptions: Array<string>;
  polesOptions: Array<number>;
  filterMotorOptions: FilterMotorOptions;
  minLabel: string = 'Min';
  maxLabel: string = 'Max';
  constructor(private sqlDbApiService: SqlDbApiService, private motorCatalogService: MotorCatalogService) { }

  ngOnInit(): void {
    let motorOptions: Array<SuiteDbMotor> = this.sqlDbApiService.selectMotors();

    let uniqMotorsByType = _.uniqBy(motorOptions, 'enclosureType');
    this.enclosureTypeOptions = _.map(uniqMotorsByType, (motor) => { return motor.enclosureType });

    let uniqEfficiencyClass = _.uniqBy(motorOptions, 'efficiencyClass');
    this.efficiencyClassOptions = _.map(uniqEfficiencyClass, (motor) => { return motor.efficiencyClass });
    let uniqPoles = _.uniqBy(motorOptions, 'poles');
    this.polesOptions = _.map(uniqPoles, (motor) => { return motor.poles });

    this.filterMotorOptions = this.motorCatalogService.filterMotorOptions.getValue();
    if (this.filterMotorOptions == undefined) {
      this.initFilterMotorOptions(motorOptions);
    }
  }

  initFilterMotorOptions(motorOptions: Array<SuiteDbMotor>) {
    this.filterMotorOptions = {
      enclosureType: undefined,
      efficiencyClass: undefined,
      lineFrequency: undefined,
      efficiencyMin: Math.floor(_.minBy(motorOptions, 'nominalEfficiency').nominalEfficiency),
      efficiencyMax: Math.ceil(_.maxBy(motorOptions, 'nominalEfficiency').nominalEfficiency),
      poles: undefined,
      voltageLimitMin: _.minBy(motorOptions, 'voltageLimit').voltageLimit,
      voltageLimitMax: _.maxBy(motorOptions, 'voltageLimit').voltageLimit,
      syncSpeedMin: _.minBy(motorOptions, 'synchronousSpeed').synchronousSpeed,
      syncSpeedMax: _.maxBy(motorOptions, 'synchronousSpeed').synchronousSpeed,
      motorPowerMin: _.minBy(motorOptions, 'hp').hp,
      motorPowerMax: _.maxBy(motorOptions, 'hp').hp
    }
    this.save();
  }

  resetFilters(){
    let motorOptions: Array<SuiteDbMotor> = this.suiteDbService.selectMotors();
    this.initFilterMotorOptions(motorOptions);
  }

  save() {
    this.motorCatalogService.filterMotorOptions.next(this.filterMotorOptions);
  }
}
