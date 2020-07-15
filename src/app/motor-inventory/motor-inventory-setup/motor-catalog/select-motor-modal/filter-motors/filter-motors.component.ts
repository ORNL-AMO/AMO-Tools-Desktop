import { Component, OnInit } from '@angular/core';
import { SuiteDbService } from '../../../../../suiteDb/suite-db.service';
import { SuiteDbMotor } from '../../../../../shared/models/materials';
import * as _ from 'lodash';

@Component({
  selector: 'app-filter-motors',
  templateUrl: './filter-motors.component.html',
  styleUrls: ['./filter-motors.component.css']
})
export class FilterMotorsComponent implements OnInit {


  constructor(private suiteDbService: SuiteDbService) { }

  ngOnInit(): void {
    let motorOptions: Array<SuiteDbMotor> = this.suiteDbService.selectMotors();
    let uniqMotorsByType = _.uniqBy(motorOptions, 'motorType');
    let types = _.map(uniqMotorsByType, (motor) => { return motor.enclosureType });
    console.log('types');
    console.log(types);
    console.log('====');
    let uniqEfficiencyClass = _.uniqBy(motorOptions, 'efficiencyType');
    let effClasses = _.map(uniqEfficiencyClass, (motor) => { return motor.efficiencyClass });
    console.log('classes');
    console.log(effClasses)
    console.log('====');
    let effMin = _.minBy(motorOptions, 'nominalEfficiency').nominalEfficiency;
    console.log('effMin: ' + effMin);
    let effMax = _.maxBy(motorOptions, 'nominalEfficiency').nominalEfficiency;
    console.log('effMax: ' + effMax);

  }
}
