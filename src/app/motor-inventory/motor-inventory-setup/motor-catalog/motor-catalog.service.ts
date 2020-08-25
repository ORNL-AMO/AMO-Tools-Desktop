import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { SuiteDbMotor } from '../../../shared/models/materials';
import { MotorItem } from '../../motor-inventory';
import { FilterMotorOptions } from './select-motor-modal/filter-motor-options.pipe';
import { MotorInventoryService } from '../../motor-inventory.service';
import { Settings } from '../../../shared/models/settings';
import { PsatService } from '../../../psat/psat.service';

@Injectable()
export class MotorCatalogService {

  selectedDepartmentId: BehaviorSubject<string>;
  selectedMotorItem: BehaviorSubject<MotorItem>;
  filterMotorOptions: BehaviorSubject<FilterMotorOptions>;
  constructor(private motorInventoryService: MotorInventoryService, private psatService: PsatService) {
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

  estimateEfficiency(loadFactor: number){
    let settings: Settings = this.motorInventoryService.settings.getValue();
    let motorInventoryData = this.motorInventoryService.motorInventoryData.getValue()
    let selectedMotorItem = this.selectedMotorItem.getValue();
    let department = motorInventoryData.departments.find(department => { return department.id = selectedMotorItem.departmentId });
    selectedMotorItem = department.catalog.find(motorItem => { return motorItem.id == selectedMotorItem.id });
    let lineFreq: number = selectedMotorItem.nameplateData.lineFrequency;
    let motorRPM: number = selectedMotorItem.nameplateData.motorRpm;
    let efficiencyClass: number = selectedMotorItem.nameplateData.efficiencyClass;
    let motorPower: number = selectedMotorItem.nameplateData.ratedMotorPower;
    return this.psatService.motorEfficiency(lineFreq, motorRPM, efficiencyClass, motorPower, loadFactor, settings);
  }
}
