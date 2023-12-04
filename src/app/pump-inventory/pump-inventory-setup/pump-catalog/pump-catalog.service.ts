import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { PumpInventoryFieldWarnings, PumpInventoryMotorWarnings, PumpItem } from '../../pump-inventory';
import { PumpInventoryService } from '../../pump-inventory.service';
import { PsatWarningService } from '../../../psat/psat-warning.service';
import { Settings } from '../../../shared/models/settings';
import { ConvertUnitsService } from '../../../shared/convert-units/convert-units.service';

@Injectable()
export class PumpCatalogService {
  selectedDepartmentId: BehaviorSubject<string>;
  selectedPumpItem: BehaviorSubject<PumpItem>;
  constructor(private pumpInventoryService: PumpInventoryService, private psatWarningService: PsatWarningService, private convertUnitsService: ConvertUnitsService
    ) {
    this.selectedDepartmentId = new BehaviorSubject<string>(undefined);
    this.selectedPumpItem = new BehaviorSubject<PumpItem>(undefined);
  }

  getUpdatedSelectedPumpItem(): PumpItem {
    let pumpInventoryData = this.pumpInventoryService.pumpInventoryData.getValue()
    let selectedPumpItem = this.selectedPumpItem.getValue();
    let department = pumpInventoryData.departments.find(department => { return department.id == selectedPumpItem.departmentId });
    selectedPumpItem = department.catalog.find(pumpItem => { return pumpItem.id == selectedPumpItem.id });
    return selectedPumpItem;
  }

  checkFieldWarnings(pump: PumpItem, settings: Settings): PumpInventoryFieldWarnings {
    //operatingFlowRate, pumpType
    let flowError: string = this.psatWarningService.checkFlowRate(pump.pumpEquipment.pumpType, pump.fieldMeasurements.operatingFlowRate, settings);
    let voltageError: string = this.psatWarningService.checkVoltage(pump.fieldMeasurements.measuredVoltage);
    let measuredPowerOrCurrentError: string = this.psatWarningService.checkMeasuredPowerOrCurrent(pump.fieldMeasurements.measuredPower, pump.fieldMeasurements.measuredCurrent, pump.pumpMotor.motorRatedPower, pump.fieldMeasurements.loadEstimationMethod, true);
    let rpmError: string = this.psatWarningService.checkPumpRpm(pump.systemProperties.driveType, pump.fieldMeasurements.pumpSpeed);
  
    return {
      flowError: flowError,
      voltageError: voltageError,
      measuredPowerOrCurrentError: measuredPowerOrCurrentError,
      rpmError: rpmError
    }
  }

  checkMotorWarnings(pump: PumpItem, settings: Settings): PumpInventoryMotorWarnings {
    let rpmError: string = this.psatWarningService.checkMotorRpm(pump.pumpMotor.lineFrequency, pump.pumpMotor.motorEfficiencyClass, pump.pumpMotor.motorRPM);
    let voltageError: string = this.psatWarningService.checkMotorVoltage(pump.pumpMotor.motorRatedVoltage);
    let ratedPowerError: string = this.checkMotorRatedPower(pump.fieldMeasurements.measuredPower, pump.fieldMeasurements.measuredCurrent, pump.pumpMotor.motorRatedPower, pump.fieldMeasurements.loadEstimationMethod, settings);
    return {
      rpmError: rpmError,
      voltageError: voltageError,
      ratedPowerError: ratedPowerError
    }
  }

  checkMotorRatedPower(measuredPower: number, measuredCurrent: number, motorRatedPower: number, loadEstimationMethod: number, settings: Settings) {
    let motorFieldPower;
    let inputTypeStr: string;
    if (loadEstimationMethod == 0) {
      motorFieldPower = measuredPower;
      inputTypeStr = 'Field Data Motor Power';
    } else {
      motorFieldPower = measuredCurrent;
      inputTypeStr = 'Field Data Motor Current';
    }

    let min: number = 5;
    let max: number = 10000;
    if (motorRatedPower < this.convertUnitsService.value(min).from('hp').to(settings.powerMeasurement)) {
      return 'Rated motor power is too small.';
    } else if (motorRatedPower > this.convertUnitsService.value(max).from('hp').to(settings.powerMeasurement)) {
      return 'Rated motor power is too large.';
    } else {

      if (motorFieldPower && motorRatedPower) {
        let val, compare;
        if (settings.powerMeasurement == 'hp') {
          val = this.convertUnitsService.value(motorRatedPower).from(settings.powerMeasurement).to('kW');
          compare = this.convertUnitsService.value(motorFieldPower).from(settings.powerMeasurement).to('kW');
        } else {
          val = motorRatedPower;
          compare = motorFieldPower;
        }
        val = val * 1.5;
        if (compare > val) {
          return 'The ' + inputTypeStr + ' is too high compared to the Rated Motor Power, please adjust the input values.';
        } else {
          return null;
        }
      } else {
        return null;
      }
    }
  }

}

