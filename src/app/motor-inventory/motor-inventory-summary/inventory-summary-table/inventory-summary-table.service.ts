import { Injectable } from '@angular/core';
import { MotorInventoryData, MotorPropertyDisplayOptions, MotorItem, LoadCharacteristicOptions, NameplateDataOptions, NameplateData, LoadCharacteristicData, ManualSpecificationOptions, ManualSpecificationData, OperationDataOptions, OperationData, BatchAnalysisOptions, BatchAnalysisData, PurchaseInformationOptions, PurchaseInformationData, TorqueOptions, TorqueData, OtherOptions, OtherData } from '../../motor-inventory';
import { Settings } from '../../../shared/models/settings';
import { MotorInventorySummaryService } from '../motor-inventory-summary.service';

@Injectable()
export class InventorySummaryTableService {

  constructor(private motorInventorySummaryService: MotorInventorySummaryService) { }

  getInventorySummaryData(motorInventoryData: MotorInventoryData, settings: Settings): InventorySummaryData {
    let motorData: Array<Array<SummaryMotorData>> = new Array();
    let fields: Array<MotorField> = this.motorInventorySummaryService.getFields(motorInventoryData.displayOptions, settings);
    motorInventoryData.departments.forEach(department => {
      department.catalog.forEach(motorItem => {
        let motorItemData = this.getMotorData(motorItem, department.name, motorInventoryData.displayOptions, settings);
        motorData.push(motorItemData);
      });
    });
    return {
      fields: fields,
      motorData: motorData
    }
  }

  getMotorData(motorItem: MotorItem, departmentName: string, displayOptions: MotorPropertyDisplayOptions, settings: Settings): Array<SummaryMotorData> {
    let motorData: Array<SummaryMotorData> = new Array();
    motorData = [{ value: motorItem.name, fieldStr: 'name' }, { value: departmentName, fieldStr: 'departmentName' }];
    //nameplate
    let nameplateData = this.getNameplateMotorData(motorItem.nameplateData, displayOptions.nameplateDataOptions, settings);
    motorData = motorData.concat(nameplateData);
    //load characteristics
    let loadCharacteristicData = this.getLoadCharactersticData(motorItem.loadCharacteristicData, displayOptions.loadCharactersticOptions);
    motorData = motorData.concat(loadCharacteristicData);
    //operations data
    let operationsData = this.getOperationsData(motorItem.operationData, displayOptions.operationDataOptions);
    motorData = motorData.concat(operationsData);
    //manual
    let manualData = this.getManualSpecificationData(motorItem.manualSpecificationData, displayOptions.manualSpecificationOptions);
    motorData = motorData.concat(manualData);
    //batch analysis
    let batchAnalysisData = this.getBatchAnalysisData(motorItem.batchAnalysisData, displayOptions.batchAnalysisOptions, settings);
    motorData = motorData.concat(batchAnalysisData);
    //purchase information
    let purchaseInfoData = this.getPurchaseInfoData(motorItem.purchaseInformationData, displayOptions.purchaseInformationOptions);
    motorData = motorData.concat(purchaseInfoData);
    //torque
    let torqueData = this.getTorqueData(motorItem.torqueData, displayOptions.torqueOptions, settings);
    motorData = motorData.concat(torqueData);
    //other
    let otherData = this.getOtherData(motorItem.otherData, displayOptions.otherOptions);
    motorData = motorData.concat(otherData);

    return motorData;
  }

  //nameplate data
  getNameplateMotorData(nameplateData: NameplateData, nameplateDataOptions: NameplateDataOptions, settings: Settings): Array<SummaryMotorData> {
    let powerUnit: string = 'hp';
    if (settings.unitsOfMeasure != 'Imperial') {
      powerUnit = 'kW';
    }
    let motorData: Array<SummaryMotorData> = [
      { value: nameplateData.efficiencyClass, pipe: 'motorEfficiencyClass', fieldStr: 'efficiencyClass' },
      { value: nameplateData.nominalEfficiency, fieldStr: 'nominalEfficiency', unit: '%' },
      { value: nameplateData.ratedMotorPower, fieldStr: 'ratedMotorPower', unit: powerUnit },
      { value: nameplateData.lineFrequency, fieldStr: 'lineFrequency', unit: 'Hz' }
    ];
    if (nameplateDataOptions.manufacturer) {
      motorData.push({ value: nameplateData.manufacturer, fieldStr: 'manufacturer' });
    }
    if (nameplateDataOptions.model) {
      motorData.push({ value: nameplateData.model, fieldStr: 'model' });
    }
    if (nameplateDataOptions.motorType) {
      motorData.push({ value: nameplateData.motorType, fieldStr: 'motorType' });
    }
    if (nameplateDataOptions.enclosureType) {
      motorData.push({ value: nameplateData.enclosureType, fieldStr: 'enclosureType' });
    }
    if (nameplateDataOptions.ratedVoltage) {
      motorData.push({ value: nameplateData.ratedVoltage, fieldStr: 'ratedVoltage', unit: 'V' });
    }
    if (nameplateDataOptions.serviceFactor) {
      motorData.push({ value: nameplateData.serviceFactor, fieldStr: 'serviceFactor' });
    }
    if (nameplateDataOptions.insulationClass) {
      motorData.push({ value: nameplateData.insulationClass, fieldStr: 'insulationClass' });
    }
    if (nameplateDataOptions.weight) {
      let weightUnit: string = 'lb';
      if (settings.unitsOfMeasure != 'Imperial') {
        weightUnit = 'kg';
      }
      motorData.push({ value: nameplateData.weight, fieldStr: 'weight', unit: weightUnit });
    }
    if (nameplateDataOptions.numberOfPhases) {
      motorData.push({ value: nameplateData.numberOfPhases, fieldStr: 'numberOfPhases' });
    }
    if (nameplateDataOptions.fullLoadSpeed) {
      motorData.push({ value: nameplateData.fullLoadSpeed, fieldStr: 'fullLoadSpeed', unit: 'rpm' });
    }
    if (nameplateDataOptions.fullLoadAmps) {
      motorData.push({ value: nameplateData.fullLoadAmps, fieldStr: 'fullLoadAmps', unit: 'A' });
    }
    return motorData;
  }
  //manual specifications
  getManualSpecificationData(manualSpecificationData: ManualSpecificationData, manualSpecificationOptions: ManualSpecificationOptions): Array<SummaryMotorData> {
    let motorData: Array<SummaryMotorData> = [{
      value: manualSpecificationData.synchronousSpeed,
      fieldStr: 'synchronousSpeed',
      unit: 'rpm'
    }];
    if (manualSpecificationOptions.displayManualSpecifications) {
      if (manualSpecificationOptions.ratedSpeed) {
        motorData.push({ value: manualSpecificationData.ratedSpeed, fieldStr: 'ratedSpeed', unit: 'rpm' });
      }
      if (manualSpecificationOptions.frame) {
        motorData.push({ value: manualSpecificationData.frame, fieldStr: 'frame' });
      }
      if (manualSpecificationOptions.shaftPosiion) {
        motorData.push({ value: manualSpecificationData.shaftPosiion, fieldStr: 'shaftPosiion' });
      }
      if (manualSpecificationOptions.windingResistance) {
        motorData.push({ value: manualSpecificationData.windingResistance, fieldStr: 'windingResistance', unit: '&#x3A9;' });
      }
      if (manualSpecificationOptions.rotorBars) {
        motorData.push({ value: manualSpecificationData.rotorBars, fieldStr: 'rotorBars' });
      }
      if (manualSpecificationOptions.statorSlots) {
        motorData.push({ value: manualSpecificationData.statorSlots, fieldStr: 'statorSlots' });
      }
      if (manualSpecificationOptions.ampsLockedRotor) {
        motorData.push({ value: manualSpecificationData.ampsLockedRotor, fieldStr: 'ampsLockedRotor', unit: 'A' });
      }
      if (manualSpecificationOptions.stalledRotorTimeHot) {
        motorData.push({ value: manualSpecificationData.stalledRotorTimeHot, fieldStr: 'stalledRotorTimeHot', unit: 's' });
      }
      if (manualSpecificationOptions.stalledRotorTimeCold) {
        motorData.push({ value: manualSpecificationData.stalledRotorTimeCold, fieldStr: 'stalledRotorTimeCold', unit: 's' });
      }
      if (manualSpecificationOptions.poles) {
        motorData.push({ value: manualSpecificationData.poles, fieldStr: 'poles' });
      }
      if (manualSpecificationOptions.currentType) {
        motorData.push({ value: manualSpecificationData.currentType, fieldStr: 'currentType' });
      }
    }
    return motorData;
  }

  //load characteristics
  getLoadCharactersticData(loadCharacteristicData: LoadCharacteristicData, loadCharactersticOptions: LoadCharacteristicOptions): Array<SummaryMotorData> {
    let motorData: Array<SummaryMotorData> = []
    if (loadCharactersticOptions.displayLoadCharacteristics) {
      if (loadCharactersticOptions.efficiency75) {
        motorData.push({ value: loadCharacteristicData.efficiency75, fieldStr: 'efficiency75', unit: '%' });
      }
      if (loadCharactersticOptions.efficiency50) {
        motorData.push({ value: loadCharacteristicData.efficiency50, fieldStr: 'efficiency50', unit: '%' });
      }
      if (loadCharactersticOptions.efficiency25) {
        motorData.push({ value: loadCharacteristicData.efficiency25, fieldStr: 'efficiency25', unit: '%' });
      }
      if (loadCharactersticOptions.powerFactor100) {
        motorData.push({ value: loadCharacteristicData.powerFactor100, fieldStr: 'powerFactor100', unit: '%' });
      }
      if (loadCharactersticOptions.powerFactor75) {
        motorData.push({ value: loadCharacteristicData.powerFactor75, fieldStr: 'powerFactor75', unit: '%' });
      }
      if (loadCharactersticOptions.powerFactor50) {
        motorData.push({ value: loadCharacteristicData.powerFactor50, fieldStr: 'powerFactor50', unit: '%' });
      }
      if (loadCharactersticOptions.powerFactor25) {
        motorData.push({ value: loadCharacteristicData.powerFactor25, fieldStr: 'powerFactor25', unit: '%' });
      }
      if (loadCharactersticOptions.ampsIdle) {
        motorData.push({ value: loadCharacteristicData.ampsIdle, fieldStr: 'ampsIdle', unit: 'A' });
      }
    }
    return motorData;
  }
  //operations
  getOperationsData(operationData: OperationData, operationDataOptions: OperationDataOptions): Array<SummaryMotorData> {
    let motorData: Array<SummaryMotorData> = []
    if (operationDataOptions.displayOperationData) {
      if (operationDataOptions.location) {
        motorData.push({ value: operationData.location, fieldStr: 'location' });
      }
      if (operationDataOptions.annualOperatingHours) {
        motorData.push({ value: operationData.annualOperatingHours, fieldStr: 'annualOperatingHours', unit: 'hrs/yr' });
      }
      if (operationDataOptions.averageLoadFactor) {
        motorData.push({ value: operationData.averageLoadFactor, fieldStr: 'averageLoadFactor', unit: '%' });
      }
      if (operationDataOptions.utilizationFactor) {
        motorData.push({ value: operationData.utilizationFactor, fieldStr: 'utilizationFactor', unit: '%' });
      }
      if (operationDataOptions.efficiencyAtAverageLoad) {
        motorData.push({ value: operationData.efficiencyAtAverageLoad, fieldStr: 'efficiencyAtAverageLoad', unit: '%' });
      }
      if (operationDataOptions.powerFactorAtLoad) {
        motorData.push({ value: operationData.powerFactorAtLoad, fieldStr: 'powerFactorAtLoad', unit: '%' });
      }
    }
    return motorData;
  }
  //batch analysis
  getBatchAnalysisData(batchAnalysisData: BatchAnalysisData, batchAnalysisOptions: BatchAnalysisOptions, settings: Settings): Array<SummaryMotorData> {
    let motorData: Array<SummaryMotorData> = []
    if (batchAnalysisOptions.displayBatchAnalysis) {
      if (batchAnalysisOptions.modifiedCost) {
        motorData.push({ value: batchAnalysisData.modifiedCost, fieldStr: 'modifiedCost', pipe: 'currency' });
      }
      if (batchAnalysisOptions.modifiedPower) {
        let powerUnit: string = 'hp';
        if (settings.unitsOfMeasure != 'Imperial') {
          powerUnit = 'kW';
        }
        motorData.push({ value: batchAnalysisData.modifiedPower, fieldStr: 'modifiedPower', unit: powerUnit });
      }
      if (batchAnalysisOptions.modifiedEfficiency) {
        motorData.push({ value: batchAnalysisData.modifiedEfficiency, fieldStr: 'modifiedEfficiency', unit: '%' });
      }
      if (batchAnalysisOptions.modifiedPercentLoad) {
        motorData.push({ value: batchAnalysisData.modifiedPercentLoad, fieldStr: 'modifiedPercentLoad', unit: '%' });
      }
      if (batchAnalysisOptions.rewindCost) {
        motorData.push({ value: batchAnalysisData.rewindCost, fieldStr: 'rewindCost', pipe: 'currency' });
      }
      if (batchAnalysisOptions.rewindEfficiencyLoss) {
        motorData.push({ value: batchAnalysisData.rewindEfficiencyLoss, fieldStr: 'rewindEfficiencyLoss', unit: '%' });
      }
    }
    return motorData;
  }

  //purchase info
  getPurchaseInfoData(purchaseInformationData: PurchaseInformationData, purchaseInformationOptions: PurchaseInformationOptions): Array<SummaryMotorData> {
    let motorData: Array<SummaryMotorData> = []
    if (purchaseInformationOptions.displayPurchaseInformation) {
      if (purchaseInformationOptions.catalogId) {
        motorData.push({ value: purchaseInformationData.catalogId, fieldStr: 'catalogId' });
      }
      if (purchaseInformationOptions.listPrice) {
        motorData.push({ value: purchaseInformationData.listPrice, fieldStr: 'listPrice', pipe: 'currency' });
      }
      if (purchaseInformationOptions.warranty) {
        motorData.push({ value: purchaseInformationData.warranty, pipe: 'date', fieldStr: 'warranty' });
      }
      if (purchaseInformationOptions.directReplacementCost) {
        motorData.push({ value: purchaseInformationData.directReplacementCost, fieldStr: 'directReplacementCost', pipe: 'currency' });
      }
    }
    return motorData;
  }
  //torque data
  getTorqueData(torqueData: TorqueData, torqueOptions: TorqueOptions, settings: Settings): Array<SummaryMotorData> {
    let motorData: Array<SummaryMotorData> = [];
    if (torqueOptions.displayTorque) {
      let torqueUnit: string = 'ft-lb';
      if (settings.unitsOfMeasure != 'Imperial') {
        torqueUnit = 'N-m';
      }

      if (torqueOptions.torqueFullLoad) {
        motorData.push({ value: torqueData.torqueFullLoad, fieldStr: 'torqueFullLoad', unit: torqueUnit });
      }
      if (torqueOptions.torqueBreakDown) {
        motorData.push({ value: torqueData.torqueBreakDown, fieldStr: 'torqueBreakDown', unit: torqueUnit });
      }
      if (torqueOptions.torqueLockedRotor) {
        motorData.push({ value: torqueData.torqueLockedRotor, fieldStr: 'torqueLockedRotor', unit: torqueUnit });
      }
    }
    return motorData;
  }

  //other data
  getOtherData(otherData: OtherData, otherOptions: OtherOptions): Array<SummaryMotorData> {
    let motorData: Array<SummaryMotorData> = [];
    if (otherOptions.displayOther) {
      if (otherOptions.driveType) {
        motorData.push({ value: otherData.driveType, fieldStr: 'driveType' });
      }
      if (otherOptions.isVFD) {
        if (otherData.isVFD) {
          motorData.push({ value: 'Yes', fieldStr: 'isVFD' });
        } else {
          motorData.push({ value: 'No', fieldStr: 'isVFD' });
        }
      }
      if (otherOptions.hasLoggerData) {
        if (otherData.hasLoggerData) {
          motorData.push({ value: 'Yes', fieldStr: 'hasLoggerData' });
        } else {
          motorData.push({ value: 'No', fieldStr: 'hasLoggerData' });
        }
      }
      if (otherOptions.voltageConnectionType) {
        motorData.push({ value: otherData.voltageConnectionType, fieldStr: 'voltageConnectionType' });
      }
    }
    return motorData;
  }
}


export interface InventorySummaryData {
  fields: Array<MotorField>,
  motorData: Array<Array<SummaryMotorData>>
}

export interface MotorField {
  display: string,
  value: string,
  group: string,
  unit?: string
}

export interface SummaryMotorData {
  fieldStr: string,
  value: number | string | Date,
  pipe?: string,
  unit?: string
}
