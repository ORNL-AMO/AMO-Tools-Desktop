import { Injectable } from '@angular/core';
import { MotorInventoryData, MotorPropertyDisplayOptions, MotorItem, LoadCharacteristicOptions, NameplateDataOptions, NameplateData, LoadCharacteristicData, ManualSpecificationOptions, ManualSpecificationData, OperationDataOptions, OperationData, BatchAnalysisOptions, BatchAnalysisData, PurchaseInformationOptions, PurchaseInformationData, TorqueOptions, TorqueData, OtherOptions, OtherData } from '../../motor-inventory';

@Injectable()
export class InventorySummaryOverviewService {

  constructor() { }

  getInventorySummaryData(motorInventoryData: MotorInventoryData): InventorySummaryData {
    let motorData: Array<Array<SummaryMotorData>> = new Array();
    let fields: Array<string> = this.getFields(motorInventoryData.displayOptions);
    motorInventoryData.departments.forEach(department => {
      department.catalog.forEach(motorItem => {
        let motorItemData = this.getMotorData(motorItem, department.name, motorInventoryData.displayOptions);
        motorData.push(motorItemData);
      });
    });
    return {
      fields: fields,
      motorData: motorData
    }
  }

  getFields(displayOptions: MotorPropertyDisplayOptions): Array<string> {
    let fields: Array<string> = ['Name', 'Department'];
    //nameplate
    let nameplateFields: Array<string> = this.getNameplateDataFields(displayOptions.nameplateDataOptions);
    fields = fields.concat(nameplateFields);
    //load characteristics
    let loadCharactersticOptions: Array<string> = this.getLoadCharacteristicsFields(displayOptions.loadCharactersticOptions);
    fields = fields.concat(loadCharactersticOptions);
    //operations data
    let operationsFields: Array<string> = this.getOperationsDataFields(displayOptions.operationDataOptions);
    fields = fields.concat(operationsFields);
    //manual
    let manualFields: Array<string> = this.getManualSpecificationsFields(displayOptions.manualSpecificationOptions);
    fields = fields.concat(manualFields);
    //batch analysis
    let batchFields: Array<string> = this.getBatchAnalysisFields(displayOptions.batchAnalysisOptions);
    fields = fields.concat(batchFields);
    //purchase information
    let purchaseInfoFields: Array<string> = this.getPurchaseInfoFields(displayOptions.purchaseInformationOptions);
    fields = fields.concat(purchaseInfoFields);
    //torque
    let torqueFields: Array<string> = this.getTorqueDataFields(displayOptions.torqueOptions);
    fields = fields.concat(torqueFields);
    //other
    let otherFields: Array<string> = this.getOtherFields(displayOptions.otherOptions);
    fields = fields.concat(otherFields)
    return fields;
  }

  getMotorData(motorItem: MotorItem, departmentName: string, displayOptions: MotorPropertyDisplayOptions): Array<SummaryMotorData> {
    let motorData: Array<SummaryMotorData> = new Array();
    motorData = [{ value: motorItem.name }, { value: departmentName }];
    //nameplate
    let nameplateData = this.getNameplateMotorData(motorItem.nameplateData, displayOptions.nameplateDataOptions);
    motorData = motorData.concat(nameplateData);
    //load characteristics
    let loadCharactristicData = this.getLoadCharactersticData(motorItem.loadCharacteristicData, displayOptions.loadCharactersticOptions);
    motorData = motorData.concat(loadCharactristicData);
    //operations data
    let operationsData = this.getOperationsData(motorItem.operationData, displayOptions.operationDataOptions);
    motorData = motorData.concat(operationsData);
    //manual
    let manualData = this.getManualSpecificationData(motorItem.manualSpecificationData, displayOptions.manualSpecificationOptions);
    motorData = motorData.concat(manualData);
    //batch analysis
    let batchAnalysisData = this.getBatchAnalysisData(motorItem.batchAnalysisData, displayOptions.batchAnalysisOptions);
    motorData = motorData.concat(batchAnalysisData);
    //purchase information
    let purchaseInfoData = this.getPurchaseInfoData(motorItem.purchaseInformationData, displayOptions.purchaseInformationOptions);
    motorData = motorData.concat(purchaseInfoData);
    //torque
    let torqueData = this.getTorqueData(motorItem.torqueData, displayOptions.torqueOptions);
    motorData = motorData.concat(torqueData);
    //other
    let otherData = this.getOtherData(motorItem.otherData, displayOptions.otherOptions);
    motorData = motorData.concat(otherData);

    return motorData;
  }

  //nameplate data
  getNameplateDataFields(nameplateDataOptions: NameplateDataOptions): Array<string> {
    let fields: Array<string> = ['Efficiency Class', 'Est. Nominal Efficiency', 'Rated Motor Power', 'Line Frequency'];
    if (nameplateDataOptions.manufacturer) {
      fields.push('Manufacturer');
    }
    if (nameplateDataOptions.model) {
      fields.push('Model');
    }
    if (nameplateDataOptions.motorType) {
      fields.push('Motor Type');
    }
    if (nameplateDataOptions.enclosureType) {
      fields.push('Enclosure Type');
    }
    if (nameplateDataOptions.ratedVoltage) {
      fields.push('Rated Voltage');
    }
    if (nameplateDataOptions.serviceFactor) {
      fields.push('Service Factor');
    }
    if (nameplateDataOptions.insulationClass) {
      fields.push('Insulation Class');
    }
    if (nameplateDataOptions.weight) {
      fields.push('Weight');
    }
    if (nameplateDataOptions.numberOfPhases) {
      fields.push('Number of Phases');
    }
    if (nameplateDataOptions.fullLoadSpeed) {
      fields.push('Full Load Speed');
    }
    if (nameplateDataOptions.fullLoadAmps) {
      fields.push('Full Load Amps');
    }
    return fields;
  }

  getNameplateMotorData(nameplateData: NameplateData, nameplateDataOptions: NameplateDataOptions): Array<SummaryMotorData> {
    let motorData: Array<SummaryMotorData> = [
      { value: nameplateData.efficiencyClass, pipe: 'motorEfficiencyClass' },
      { value: nameplateData.nominalEfficiency },
      { value: nameplateData.ratedMotorPower },
      { value: nameplateData.lineFrequency }
    ];
    if (nameplateDataOptions.manufacturer) {
      motorData.push({ value: nameplateData.manufacturer });
    }
    if (nameplateDataOptions.model) {
      motorData.push({ value: nameplateData.model });
    }
    if (nameplateDataOptions.motorType) {
      motorData.push({ value: nameplateData.motorType });
    }
    if (nameplateDataOptions.enclosureType) {
      motorData.push({ value: nameplateData.enclosureType });
    }
    if (nameplateDataOptions.ratedVoltage) {
      motorData.push({ value: nameplateData.ratedVoltage });
    }
    if (nameplateDataOptions.serviceFactor) {
      motorData.push({ value: nameplateData.serviceFactor });
    }
    if (nameplateDataOptions.insulationClass) {
      motorData.push({ value: nameplateData.insulationClass });
    }
    if (nameplateDataOptions.weight) {
      motorData.push({ value: nameplateData.weight });
    }
    if (nameplateDataOptions.numberOfPhases) {
      motorData.push({ value: nameplateData.numberOfPhases });
    }
    if (nameplateDataOptions.fullLoadSpeed) {
      motorData.push({ value: nameplateData.fullLoadSpeed });
    }
    if (nameplateDataOptions.fullLoadAmps) {
      motorData.push({ value: nameplateData.fullLoadAmps });
    }
    return motorData;
  }
  //manual specifications
  getManualSpecificationsFields(manualSpecificationOptions: ManualSpecificationOptions): Array<string> {
    let fields: Array<string> = ['Synchronous Speed'];

    if (manualSpecificationOptions.displayManualSpecifications) {
      if (manualSpecificationOptions.frameNumber) {
        fields.push('Frame Number');
      }
      if (manualSpecificationOptions.uFrame) {
        fields.push('uFrame');
      }
      if (manualSpecificationOptions.cFace) {
        fields.push('cFace');
      }
      if (manualSpecificationOptions.verticalShaft) {
        fields.push('Vertical Shaft');
      }
      if (manualSpecificationOptions.dFlange) {
        fields.push('dFlange');
      }
      if (manualSpecificationOptions.windingResistance) {
        fields.push('Winding Resistance');
      }
      if (manualSpecificationOptions.rotorBars) {
        fields.push('Rotor Bars');
      }
      if (manualSpecificationOptions.statorSlots) {
        fields.push('Stator Slots');
      }
      if (manualSpecificationOptions.ampsLockedRotor) {
        fields.push('Amps Locked Rotor');
      }
      if (manualSpecificationOptions.stalledRotorTimeHot) {
        fields.push('Stalled Rotor Time - Hot');
      }
      if (manualSpecificationOptions.stalledRotorTimeCold) {
        fields.push('Stalled Rotor Time - Cold');
      }
      if (manualSpecificationOptions.poles) {
        fields.push('Poles');
      }
      if (manualSpecificationOptions.currentType) {
        fields.push('Current Type');
      }
    }
    return fields;
  }

  getManualSpecificationData(manualSpecificationData: ManualSpecificationData, manualSpecificationOptions: ManualSpecificationOptions): Array<SummaryMotorData> {
    let motorData: Array<SummaryMotorData> = [{ value: manualSpecificationData.synchronousSpeed }];
    if (manualSpecificationOptions.displayManualSpecifications) {
      if (manualSpecificationOptions.frameNumber) {
        motorData.push({ value: manualSpecificationData.frameNumber });
      }
      if (manualSpecificationOptions.uFrame) {
        motorData.push({ value: manualSpecificationData.uFrame });
      }
      if (manualSpecificationOptions.cFace) {
        motorData.push({ value: manualSpecificationData.cFace });
      }
      if (manualSpecificationOptions.verticalShaft) {
        motorData.push({ value: manualSpecificationData.verticalShaft });
      }
      if (manualSpecificationOptions.dFlange) {
        motorData.push({ value: manualSpecificationData.dFlange });
      }
      if (manualSpecificationOptions.windingResistance) {
        motorData.push({ value: manualSpecificationData.windingResistance });
      }
      if (manualSpecificationOptions.rotorBars) {
        motorData.push({ value: manualSpecificationData.rotorBars });
      }
      if (manualSpecificationOptions.statorSlots) {
        motorData.push({ value: manualSpecificationData.statorSlots });
      }
      if (manualSpecificationOptions.ampsLockedRotor) {
        motorData.push({ value: manualSpecificationData.ampsLockedRotor });
      }
      if (manualSpecificationOptions.stalledRotorTimeHot) {
        motorData.push({ value: manualSpecificationData.stalledRotorTimeHot });
      }
      if (manualSpecificationOptions.stalledRotorTimeCold) {
        motorData.push({ value: manualSpecificationData.stalledRotorTimeCold });
      }
      if (manualSpecificationOptions.poles) {
        motorData.push({ value: manualSpecificationData.poles });
      }
      if (manualSpecificationOptions.currentType) {
        motorData.push({ value: manualSpecificationData.currentType });
      }
    }
    return motorData;
  }

  //load characteristics
  getLoadCharacteristicsFields(loadCharactersticOptions: LoadCharacteristicOptions): Array<string> {
    let fields: Array<string> = [];
    if (loadCharactersticOptions.displayLoadCharacteristics) {
      if (loadCharactersticOptions.efficiency75) {
        fields.push('Efficiency at 75% Load');
      }
      if (loadCharactersticOptions.efficiency50) {
        fields.push('Efficiency at 50% Load');
      }
      if (loadCharactersticOptions.efficiency25) {
        fields.push('Efficiency at 25% Load');
      }
      if (loadCharactersticOptions.powerFactor100) {
        fields.push('Power Factor at Full Load');
      }
      if (loadCharactersticOptions.powerFactor75) {
        fields.push('Power Factor at 75% Load');
      }
      if (loadCharactersticOptions.powerFactor50) {
        fields.push('Power Factor at 50% Load');
      }
      if (loadCharactersticOptions.powerFactor25) {
        fields.push('Power Factor at 25% Load');
      }
      if (loadCharactersticOptions.ampsIdle) {
        fields.push('Amps Idle');
      }
    }
    return fields;
  }

  getLoadCharactersticData(loadCharactristicData: LoadCharacteristicData, loadCharactersticOptions: LoadCharacteristicOptions): Array<SummaryMotorData> {
    let motorData: Array<SummaryMotorData> = []
    if (loadCharactersticOptions.displayLoadCharacteristics) {
      if (loadCharactersticOptions.efficiency75) {
        motorData.push({ value: loadCharactristicData.efficiency75 });
      }
      if (loadCharactersticOptions.efficiency50) {
        motorData.push({ value: loadCharactristicData.efficiency50 });
      }
      if (loadCharactersticOptions.efficiency25) {
        motorData.push({ value: loadCharactristicData.efficiency25 });
      }
      if (loadCharactersticOptions.powerFactor100) {
        motorData.push({ value: loadCharactristicData.powerFactor100 });
      }
      if (loadCharactersticOptions.powerFactor75) {
        motorData.push({ value: loadCharactristicData.powerFactor75 });
      }
      if (loadCharactersticOptions.powerFactor50) {
        motorData.push({ value: loadCharactristicData.powerFactor50 });
      }
      if (loadCharactersticOptions.powerFactor25) {
        motorData.push({ value: loadCharactristicData.powerFactor25 });
      }
      if (loadCharactersticOptions.ampsIdle) {
        motorData.push({ value: loadCharactristicData.ampsIdle });
      }
    }
    return motorData;
  }
  //operations
  getOperationsDataFields(operationDataOptions: OperationDataOptions): Array<string> {
    let fields: Array<string> = new Array();
    if (operationDataOptions.displayOperationData) {
      if (operationDataOptions.ratedSpeed) {
        fields.push('Rated Speed');
      }
      if (operationDataOptions.purpose) {
        fields.push('Purpose');
      }
      if (operationDataOptions.annualOperatingHours) {
        fields.push('Operating Hours');
      }
      if (operationDataOptions.averageLoadFactor) {
        fields.push('Average Load Factor');
      }
      if (operationDataOptions.utilizationFactor) {
        fields.push('Utilization Factor');
      }
      if (operationDataOptions.percentLoad) {
        fields.push('Percent Load');
      }
      if (operationDataOptions.powerFactorAtLoad) {
        fields.push('Power Factor at Load');
      }
    }
    return fields;
  }

  getOperationsData(operationsData: OperationData, operationDataOptions: OperationDataOptions): Array<SummaryMotorData> {
    let motorData: Array<SummaryMotorData> = []
    if (operationDataOptions.displayOperationData) {
      if (operationDataOptions.ratedSpeed) {
        motorData.push({ value: operationsData.ratedSpeed });
      }
      if (operationDataOptions.purpose) {
        motorData.push({ value: operationsData.purpose });
      }
      if (operationDataOptions.annualOperatingHours) {
        motorData.push({ value: operationsData.annualOperatingHours });
      }
      if (operationDataOptions.averageLoadFactor) {
        motorData.push({ value: operationsData.averageLoadFactor });
      }
      if (operationDataOptions.utilizationFactor) {
        motorData.push({ value: operationsData.utilizationFactor });
      }
      if (operationDataOptions.percentLoad) {
        motorData.push({ value: operationsData.percentLoad });
      }
      if (operationDataOptions.powerFactorAtLoad) {
        motorData.push({ value: operationsData.powerFactorAtLoad });
      }
    }
    return motorData;
  }
  //batch analysis
  getBatchAnalysisFields(batchAnalysisOptions: BatchAnalysisOptions): Array<string> {
    let fields: Array<string> = new Array();
    if (batchAnalysisOptions.displayBatchAnalysis) {
      if (batchAnalysisOptions.modifiedCost) {
        fields.push('Modified Cost');
      }
      if (batchAnalysisOptions.modifiedPower) {
        fields.push('Modified Power');
      }
      if (batchAnalysisOptions.modifiedEfficiency) {
        fields.push('Modified Efficiency');
      }
      if (batchAnalysisOptions.modifiedPercentLoad) {
        fields.push('Modified Percent Load');
      }
      if (batchAnalysisOptions.rewindCost) {
        fields.push('Rewind Cost');
      }
      if (batchAnalysisOptions.rewindEfficiencyLoss) {
        fields.push('Rewind Efficiency Loss');
      }
    }
    return fields;
  }

  getBatchAnalysisData(batchAnalysisData: BatchAnalysisData, batchAnalysisOptions: BatchAnalysisOptions): Array<SummaryMotorData> {
    let motorData: Array<SummaryMotorData> = []
    if (batchAnalysisOptions.displayBatchAnalysis) {
      if (batchAnalysisOptions.modifiedCost) {
        motorData.push({ value: batchAnalysisData.modifiedCost });
      }
      if (batchAnalysisOptions.modifiedPower) {
        motorData.push({ value: batchAnalysisData.modifiedPower });
      }
      if (batchAnalysisOptions.modifiedEfficiency) {
        motorData.push({ value: batchAnalysisData.modifiedEfficiency });
      }
      if (batchAnalysisOptions.modifiedPercentLoad) {
        motorData.push({ value: batchAnalysisData.modifiedPercentLoad });
      }
      if (batchAnalysisOptions.rewindCost) {
        motorData.push({ value: batchAnalysisData.rewindCost });
      }
      if (batchAnalysisOptions.rewindEfficiencyLoss) {
        motorData.push({ value: batchAnalysisData.rewindEfficiencyLoss });
      }
    }
    return motorData;
  }

  //purchase info
  getPurchaseInfoFields(purchaseInformationOptions: PurchaseInformationOptions): Array<string> {
    let fields: Array<string> = new Array();
    if (purchaseInformationOptions.displayPurchaseInformation) {
      if (purchaseInformationOptions.catalogId) {
        fields.push('Catalog ID');
      }
      if (purchaseInformationOptions.listPrice) {
        fields.push('List Price');
      }
      if (purchaseInformationOptions.warranty) {
        fields.push('Warranty');
      }
      if (purchaseInformationOptions.directReplacementCost) {
        fields.push('Direct Replacement Cost');
      }
    }
    return fields;
  }

  getPurchaseInfoData(purchaseInformationData: PurchaseInformationData, purchaseInformationOptions: PurchaseInformationOptions): Array<SummaryMotorData> {
    let motorData: Array<SummaryMotorData> = []
    if (purchaseInformationOptions.displayPurchaseInformation) {
      if (purchaseInformationOptions.catalogId) {
        motorData.push({ value: purchaseInformationData.catalogId });
      }
      if (purchaseInformationOptions.listPrice) {
        motorData.push({ value: purchaseInformationData.listPrice });
      }
      if (purchaseInformationOptions.warranty) {
        motorData.push({ value: purchaseInformationData.warranty });
      }
      if (purchaseInformationOptions.directReplacementCost) {
        motorData.push({ value: purchaseInformationData.directReplacementCost });
      }
    }
    return motorData;
  }
  //torque data
  getTorqueDataFields(torqueOptions: TorqueOptions): Array<string> {
    let fields: Array<string> = new Array();
    if (torqueOptions.displayTorque) {
      if (torqueOptions.torqueFullLoad) {
        fields.push('Torque Full Load');
      }
      if (torqueOptions.torqueBreakDown) {
        fields.push('Torque Break Down');
      }
      if (torqueOptions.torqueLockedRotor) {
        fields.push('Torque Locked Rotor');
      }
    }
    return fields;
  }

  getTorqueData(torqueData: TorqueData, torqueOptions: TorqueOptions): Array<SummaryMotorData> {
    let motorData: Array<SummaryMotorData> = [];
    if (torqueOptions.displayTorque) {
      if (torqueOptions.torqueFullLoad) {
        motorData.push({ value: torqueData.torqueFullLoad });
      }
      if (torqueOptions.torqueBreakDown) {
        motorData.push({ value: torqueData.torqueBreakDown });
      }
      if (torqueOptions.torqueLockedRotor) {
        motorData.push({ value: torqueData.torqueLockedRotor });
      }
    }
    return motorData;
  }

  //other data
  getOtherFields(otherOptions: OtherOptions): Array<string> {
    let fields: Array<string> = new Array();
    if (otherOptions.displayOther) {
      if (otherOptions.driveType) {
        fields.push('Drive Type');
      }
      if (otherOptions.isVFD) {
        fields.push('Is VFD?');
      }
      if (otherOptions.hasLoggerData) {
        fields.push('Has Logger Data');
      }
      if (otherOptions.voltageConnectionType) {
        fields.push('Voltage Connection Type');
      }
    }
    return fields;
  }

  getOtherData(otherData: OtherData, otherOptions: OtherOptions): Array<SummaryMotorData> {
    let motorData: Array<SummaryMotorData> = [];
    if (otherOptions.displayOther) {
      if (otherOptions.driveType) {
        motorData.push({ value: otherData.driveType });
      }
      if (otherOptions.isVFD) {
        if (otherData.isVFD) {
          motorData.push({ value: 'Yes' });
        } else {
          motorData.push({ value: 'No' });
        }
      }
      if (otherOptions.hasLoggerData) {
        if (otherData.hasLoggerData) {
          motorData.push({ value: 'Yes' });
        } else {
          motorData.push({ value: 'No' });
        }
      }
      if (otherOptions.voltageConnectionType) {
        motorData.push({ value: otherData.voltageConnectionType });
      }
    }
    return motorData;
  }
}

export interface InventorySummaryData {
  fields: Array<string>,
  motorData: Array<Array<SummaryMotorData>>
}


export interface SummaryMotorData {
  value: number | string | Date,
  pipe?: string
}
