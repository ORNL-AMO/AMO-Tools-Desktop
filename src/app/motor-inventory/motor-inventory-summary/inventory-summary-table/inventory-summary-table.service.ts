import { Injectable } from '@angular/core';
import { MotorInventoryData, MotorPropertyDisplayOptions, MotorItem, LoadCharacteristicOptions, NameplateDataOptions, NameplateData, LoadCharacteristicData, ManualSpecificationOptions, ManualSpecificationData, OperationDataOptions, OperationData, BatchAnalysisOptions, BatchAnalysisData, PurchaseInformationOptions, PurchaseInformationData, TorqueOptions, TorqueData, OtherOptions, OtherData } from '../../motor-inventory';
import { Settings } from '../../../shared/models/settings';

@Injectable()
export class InventorySummaryTableService {

  constructor() { }
  getInventorySummaryData(motorInventoryData: MotorInventoryData, settings: Settings): InventorySummaryData {
    let motorData: Array<Array<SummaryMotorData>> = new Array();
    let fields: Array<MotorField> = this.getFields(motorInventoryData.displayOptions, settings);
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

  getFields(displayOptions: MotorPropertyDisplayOptions, settings: Settings): Array<MotorField> {
    let fields: Array<MotorField> = [{
      display: 'Name',
      value: 'name',
      group: 'nameplateData'
    }, {
      display: 'Department',
      value: 'department',
      group: 'nameplateData'
    }];
    //nameplate
    let nameplateFields: Array<MotorField> = this.getNameplateDataFields(displayOptions.nameplateDataOptions, settings);
    fields = fields.concat(nameplateFields);
    //load characteristics
    let loadCharactersticOptions: Array<MotorField> = this.getLoadCharacteristicsFields(displayOptions.loadCharactersticOptions);
    fields = fields.concat(loadCharactersticOptions);
    //operations data
    let operationsFields: Array<MotorField> = this.getOperationsDataFields(displayOptions.operationDataOptions);
    fields = fields.concat(operationsFields);
    //manual
    let manualFields: Array<MotorField> = this.getManualSpecificationsFields(displayOptions.manualSpecificationOptions);
    fields = fields.concat(manualFields);
    //batch analysis
    let batchFields: Array<MotorField> = this.getBatchAnalysisFields(displayOptions.batchAnalysisOptions, settings);
    fields = fields.concat(batchFields);
    //purchase information
    let purchaseInfoFields: Array<MotorField> = this.getPurchaseInfoFields(displayOptions.purchaseInformationOptions);
    fields = fields.concat(purchaseInfoFields);
    //torque
    let torqueFields: Array<MotorField> = this.getTorqueDataFields(displayOptions.torqueOptions, settings);
    fields = fields.concat(torqueFields);
    //other
    let otherFields: Array<MotorField> = this.getOtherFields(displayOptions.otherOptions);
    fields = fields.concat(otherFields)
    return fields;
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
  getNameplateDataFields(nameplateDataOptions: NameplateDataOptions, settings: Settings): Array<MotorField> {
    let powerUnit: string = 'hp';
    if (settings.unitsOfMeasure != 'Imperial') {
      powerUnit = 'kW';
    }
    let fields: Array<MotorField> = [
      { display: 'Efficiency Class', value: 'efficiencyClass', group: 'nameplateData' },
      { display: 'Est. Nominal Efficiency', value: 'nominalEfficiency', group: 'nameplateData', unit: '%' },
      { display: 'Rated Motor Power', value: 'ratedMotorPower', group: 'nameplateData', unit: powerUnit },
      { display: 'Line Frequency', value: 'lineFrequency', group: 'nameplateData', unit: 'Hz' }
    ];
    if (nameplateDataOptions.manufacturer) {
      fields.push({ display: 'Manufacturer', value: 'manufacturer', group: 'nameplateData' });
    }
    if (nameplateDataOptions.model) {
      fields.push({ display: 'Model', value: 'model', group: 'nameplateData' });
    }
    if (nameplateDataOptions.motorType) {
      fields.push({ display: 'Motor Type', value: 'motorType', group: 'nameplateData' });
    }
    if (nameplateDataOptions.enclosureType) {
      fields.push({ display: 'Enclosure Type', value: 'enclosureType', group: 'nameplateData' });
    }
    if (nameplateDataOptions.ratedVoltage) {
      fields.push({ display: 'Rated Voltage', value: 'ratedVoltage', group: 'nameplateData', unit: 'V' });
    }
    if (nameplateDataOptions.serviceFactor) {
      fields.push({ display: 'Service Factor', value: 'serviceFactor', group: 'nameplateData' });
    }
    if (nameplateDataOptions.insulationClass) {
      fields.push({ display: 'Insulation Class', value: 'insulationClass', group: 'nameplateData' });
    }
    if (nameplateDataOptions.weight) {
      let weightUnit: string = 'lb';
      if (settings.unitsOfMeasure != 'Imperial') {
        weightUnit = 'kg';
      }
      fields.push({ display: 'Weight', value: 'weight', group: 'nameplateData', unit: weightUnit });
    }
    if (nameplateDataOptions.numberOfPhases) {
      fields.push({ display: 'Number of Phases', value: 'numberOfPhases', group: 'nameplateData' });
    }
    if (nameplateDataOptions.fullLoadSpeed) {
      fields.push({ display: 'Full Load Speed', value: 'fullLoadSpeed', group: 'nameplateData', unit: 'rpm' });
    }
    if (nameplateDataOptions.fullLoadAmps) {
      fields.push({ display: 'Full Load Amps', value: 'fullLoadAmps', group: 'nameplateData', unit: 'A' });
    }
    return fields;
  }

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
  getManualSpecificationsFields(manualSpecificationOptions: ManualSpecificationOptions): Array<MotorField> {
    let fields: Array<MotorField> = [
      { display: 'Synchronous Speed', value: 'synchronousSpeed', group: 'manualSpecificationData', unit: 'rpm' }];

    if (manualSpecificationOptions.displayManualSpecifications) {

      if (manualSpecificationOptions.ratedSpeed) {
        fields.push({ display: 'Rated Speed', value: 'ratedSpeed', group: 'manualSpecificationData', unit: 'rpm' });
      }
      if (manualSpecificationOptions.frame) {
        fields.push({ display: 'Frame', value: 'frame', group: 'manualSpecificationData' });
      }
      if (manualSpecificationOptions.shaftPosiion) {
        fields.push({ display: 'Shaft Position', value: 'shaftPosiion', group: 'manualSpecificationData' });
      }
      if (manualSpecificationOptions.windingResistance) {
        fields.push({ display: 'Winding Resistance', value: 'windingResistance', group: 'manualSpecificationData', unit: '&#x3A9;' });
      }
      if (manualSpecificationOptions.rotorBars) {
        fields.push({ display: 'Rotor Bars', value: 'rotorBars', group: 'manualSpecificationData' });
      }
      if (manualSpecificationOptions.statorSlots) {
        fields.push({ display: 'Stator Slots', value: 'statorSlots', group: 'manualSpecificationData' });
      }
      if (manualSpecificationOptions.ampsLockedRotor) {
        fields.push({ display: 'Amps Locked Rotor', value: 'ampsLockedRotor', group: 'manualSpecificationData', unit: 'A' });
      }
      if (manualSpecificationOptions.stalledRotorTimeHot) {
        fields.push({ display: 'Stalled Rotor Time - Hot', value: 'stalledRotorTimeHot', group: 'manualSpecificationData', unit: 's' });
      }
      if (manualSpecificationOptions.stalledRotorTimeCold) {
        fields.push({ display: 'Stalled Rotor Time - Cold', value: 'stalledRotorTimeCold', group: 'manualSpecificationData', unit: 's' });
      }
      if (manualSpecificationOptions.poles) {
        fields.push({ display: 'Poles', value: 'poles', group: 'manualSpecificationData' });
      }
      if (manualSpecificationOptions.currentType) {
        fields.push({ display: 'Current Type', value: 'currentType', group: 'manualSpecificationData' });
      }
    }
    return fields;
  }

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
  getLoadCharacteristicsFields(loadCharactersticOptions: LoadCharacteristicOptions): Array<MotorField> {
    let fields: Array<MotorField> = [];
    if (loadCharactersticOptions.displayLoadCharacteristics) {
      if (loadCharactersticOptions.efficiency75) {
        fields.push({ display: 'Efficiency at 75% Load', value: 'efficiency75', group: 'loadCharacteristicData', unit: '%' });
      }
      if (loadCharactersticOptions.efficiency50) {
        fields.push({ display: 'Efficiency at 50% Load', value: 'efficiency50', group: 'loadCharacteristicData', unit: '%' });
      }
      if (loadCharactersticOptions.efficiency25) {
        fields.push({ display: 'Efficiency at 25% Load', value: 'efficiency25', group: 'loadCharacteristicData', unit: '%' });
      }
      if (loadCharactersticOptions.powerFactor100) {
        fields.push({ display: 'Power Factor at Full Load', value: 'powerFactor100', group: 'loadCharacteristicData', unit: '%' });
      }
      if (loadCharactersticOptions.powerFactor75) {
        fields.push({ display: 'Power Factor at 75% Load', value: 'powerFactor75', group: 'loadCharacteristicData', unit: '%' });
      }
      if (loadCharactersticOptions.powerFactor50) {
        fields.push({ display: 'Power Factor at 50% Load', value: 'powerFactor50', group: 'loadCharacteristicData', unit: '%' });
      }
      if (loadCharactersticOptions.powerFactor25) {
        fields.push({ display: 'Power Factor at 25% Load', value: 'powerFactor25', group: 'loadCharacteristicData', unit: '%' });
      }
      if (loadCharactersticOptions.ampsIdle) {
        fields.push({ display: 'Amps Idle', value: 'ampsIdle', group: 'loadCharacteristicData', unit: 'A' });
      }
    }
    return fields;
  }

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
  getOperationsDataFields(operationDataOptions: OperationDataOptions): Array<MotorField> {
    let fields: Array<MotorField> = new Array();
    if (operationDataOptions.displayOperationData) {
      if (operationDataOptions.location) {
        fields.push({ display: 'Location', value: 'location', group: 'operationData' });
      }
      if (operationDataOptions.annualOperatingHours) {
        fields.push({ display: 'Operating Hours', value: 'annualOperatingHours', group: 'operationData', unit: 'hrs/yr' });
      }
      if (operationDataOptions.averageLoadFactor) {
        fields.push({ display: 'Average Load Factor', value: 'averageLoadFactor', group: 'operationData', unit: '%' });
      }
      if (operationDataOptions.utilizationFactor) {
        fields.push({ display: 'Utilization Factor', value: 'utilizationFactor', group: 'operationData', unit: '%' });
      }
      if (operationDataOptions.efficiencyAtAverageLoad) {
        fields.push({ display: 'Efficiency at Average Load', value: 'efficiencyAtAverageLoad', group: 'operationData', unit: '%' });
      }
      if (operationDataOptions.powerFactorAtLoad) {
        fields.push({ display: 'Power Factor at Load', value: 'powerFactorAtLoad', group: 'operationData', unit: '%' });
      }
    }
    return fields;
  }

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
  getBatchAnalysisFields(batchAnalysisOptions: BatchAnalysisOptions, settings: Settings): Array<MotorField> {
    let fields: Array<MotorField> = new Array();
    if (batchAnalysisOptions.displayBatchAnalysis) {
      if (batchAnalysisOptions.modifiedCost) {
        fields.push({ display: 'Modified Cost', value: 'modifiedCost', group: 'batchAnalysisData' });
      }
      if (batchAnalysisOptions.modifiedPower) {
        let powerUnit: string = 'hp';
        if (settings.unitsOfMeasure != 'Imperial') {
          powerUnit = 'kW';
        }
        fields.push({ display: 'Modified Power', value: 'modifiedPower', group: 'batchAnalysisData', unit: powerUnit });
      }
      if (batchAnalysisOptions.modifiedEfficiency) {
        fields.push({ display: 'Modified Efficiency', value: 'modifiedEfficiency', group: 'batchAnalysisData', unit: '%' });
      }
      if (batchAnalysisOptions.modifiedPercentLoad) {
        fields.push({ display: 'Modified Percent Load', value: 'modifiedPercentLoad', group: 'batchAnalysisData', unit: '%' });
      }
      if (batchAnalysisOptions.rewindCost) {
        fields.push({ display: 'Rewind Cost', value: 'rewindCost', group: 'batchAnalysisData', unit: '$' });
      }
      if (batchAnalysisOptions.rewindEfficiencyLoss) {
        fields.push({ display: 'Rewind Efficiency Loss', value: 'rewindEfficiencyLoss', group: 'batchAnalysisData', unit: '%' });
      }
    }
    return fields;
  }

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
  getPurchaseInfoFields(purchaseInformationOptions: PurchaseInformationOptions): Array<MotorField> {
    let fields: Array<MotorField> = new Array();
    if (purchaseInformationOptions.displayPurchaseInformation) {
      if (purchaseInformationOptions.catalogId) {
        fields.push({ display: 'Catalog ID', value: 'catalogId', group: 'purchaseInformationData' });
      }
      if (purchaseInformationOptions.listPrice) {
        fields.push({ display: 'List Price', value: 'listPrice', group: 'purchaseInformationData', unit: '$' });
      }
      if (purchaseInformationOptions.warranty) {
        fields.push({ display: 'Warranty', value: 'warranty', group: 'purchaseInformationData' });
      }
      if (purchaseInformationOptions.directReplacementCost) {
        fields.push({ display: 'Direct Replacement Cost', value: 'directReplacementCost', group: 'purchaseInformationData', unit: '$' });
      }
    }
    return fields;
  }

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
  getTorqueDataFields(torqueOptions: TorqueOptions, settings: Settings): Array<MotorField> {
    let fields: Array<MotorField> = new Array();
    if (torqueOptions.displayTorque) {
      let torqueUnit: string = 'ft-lb';
      if (settings.unitsOfMeasure != 'Imperial') {
        torqueUnit = 'N-m';
      }
      if (torqueOptions.torqueFullLoad) {
        fields.push({ display: 'Torque Full Load', value: 'torqueFullLoad', group: 'torqueData', unit: torqueUnit });
      }
      if (torqueOptions.torqueBreakDown) {
        fields.push({ display: 'Torque Break Down', value: 'torqueBreakDown', group: 'torqueData' , unit: torqueUnit});
      }
      if (torqueOptions.torqueLockedRotor) {
        fields.push({ display: 'Torque Locked Rotor', value: 'torqueLockedRotor', group: 'torqueData', unit: torqueUnit });
      }
    }
    return fields;
  }

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
  getOtherFields(otherOptions: OtherOptions): Array<MotorField> {
    let fields: Array<MotorField> = new Array();
    if (otherOptions.displayOther) {
      if (otherOptions.driveType) {
        fields.push({ display: 'Drive Type', value: 'driveType', group: 'otherData' });
      }
      if (otherOptions.isVFD) {
        fields.push({ display: 'Is VFD?', value: 'isVFD', group: 'otherData' });
      }
      if (otherOptions.hasLoggerData) {
        fields.push({ display: 'Has Logger Data', value: 'hasLoggerData', group: 'otherData' });
      }
      if (otherOptions.voltageConnectionType) {
        fields.push({ display: 'Voltage Connection Type', value: 'voltageConnectionType', group: 'otherData' });
      }
    }
    return fields;
  }

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
