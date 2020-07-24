import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { SuiteDbMotor } from '../../../shared/models/materials';
import { MotorItem } from '../../motor-inventory';
import { FilterMotorOptions } from './select-motor-modal/filter-motor-options.pipe';

@Injectable()
export class MotorCatalogService {

  selectedDepartmentId: BehaviorSubject<string>;
  selectedMotorItem: BehaviorSubject<MotorItem>;
  filterMotorOptions: BehaviorSubject<FilterMotorOptions>;
  constructor() {
    this.selectedDepartmentId = new BehaviorSubject<string>(undefined);
    this.selectedMotorItem = new BehaviorSubject<MotorItem>(undefined);
    this.filterMotorOptions = new BehaviorSubject<FilterMotorOptions>(undefined);
  }

  setSuiteDbMotorProperties(motor: SuiteDbMotor, motorItem: MotorItem) {
    motorItem.nameplateData.efficiencyClass = motor.efficiencyClass;
    motorItem.nameplateData.ratedMotorPower = motor.hp;
    motorItem.nameplateData.lineFrequency = motor.lineFrequency;
    motorItem.nameplateData.enclosureType = motor.enclosureType;
    motorItem.nemaTable = motor.nemaTable;
    motorItem.nameplateData.nominalEfficiency = motor.nominalEfficiency;
    motorItem.manualSpecificationData.poles = motor.poles;
    motorItem.manualSpecificationData.synchronousSpeed = motor.synchronousSpeed;
    motorItem.voltageLimit = motor.voltageLimit;
    return motorItem;
  }
}
