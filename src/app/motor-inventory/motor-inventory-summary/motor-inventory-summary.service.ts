import { Injectable } from '@angular/core';
import { MotorPropertyDisplayOptions, OtherOptions, TorqueOptions, PurchaseInformationOptions, BatchAnalysisOptions, OperationDataOptions, LoadCharacteristicOptions, ManualSpecificationOptions, NameplateDataOptions, MotorInventoryData, MotorInventoryDepartment, MotorItem, FilterInventorySummary } from '../motor-inventory';
import { MotorField } from './inventory-summary-table/inventory-summary-table.service';
import { Settings } from '../../shared/models/settings';
import { BehaviorSubject } from 'rxjs';
import * as _ from 'lodash';
@Injectable()
export class MotorInventorySummaryService {

  filterInventorySummary: BehaviorSubject<FilterInventorySummary>;
  constructor() {
    this.filterInventorySummary = new BehaviorSubject({
      selectedDepartmentIds: new Array(),
      efficiencyClasses: new Array(),
      ratedPower: new Array(),
      ratedVoltage: new Array()
    });
  }


  getAllMotors(inventoryData: MotorInventoryData): Array<MotorItem> {
    let allMotors: Array<MotorItem> = _.flatMap(inventoryData.departments, (department) => { return department.catalog });
    return allMotors;
  }

  filterMotorInventoryData(inventoryData: MotorInventoryData, filterInventorySummary: FilterInventorySummary): MotorInventoryData {
    let filteredInventoryData: MotorInventoryData = JSON.parse(JSON.stringify(inventoryData));
    if (filterInventorySummary.selectedDepartmentIds.length != 0) {
      filteredInventoryData.departments = _.filter(filteredInventoryData.departments, (department) => {
        return _.find(filterInventorySummary.selectedDepartmentIds, (id) => { return department.id == id }) != undefined;
      });
    }
    if (filterInventorySummary.efficiencyClasses.length != 0) {
      filteredInventoryData.departments.forEach(department => {
        department.catalog = _.filter(department.catalog, (motorItem) => {
          return _.includes(filterInventorySummary.efficiencyClasses, motorItem.nameplateData.efficiencyClass);
        })
      });
    }
    if (filterInventorySummary.ratedPower.length != 0) {
      filteredInventoryData.departments.forEach(department => {
        department.catalog = _.filter(department.catalog, (motorItem) => {
          return _.includes(filterInventorySummary.ratedPower, motorItem.nameplateData.ratedMotorPower);
        })
      });
    }
    if (filterInventorySummary.ratedVoltage.length != 0) {
      filteredInventoryData.departments.forEach(department => {
        department.catalog = _.filter(department.catalog, (motorItem) => {
          return _.includes(filterInventorySummary.ratedVoltage, motorItem.nameplateData.ratedVoltage);
        })
      });
    }
    return filteredInventoryData;
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
        fields.push({ display: 'Shaft Orientation', value: 'shaftPosiion', group: 'manualSpecificationData' });
      }
      if (manualSpecificationOptions.windingResistance) {
        fields.push({ display: 'Winding Resistance', value: 'windingResistance', group: 'manualSpecificationData', unit: '&#x3A9;' });
      }
      if (manualSpecificationOptions.rotorBars) {
        fields.push({ display: 'Number of Rotor Bars', value: 'rotorBars', group: 'manualSpecificationData' });
      }
      if (manualSpecificationOptions.statorSlots) {
        fields.push({ display: 'Number of Stator Slots', value: 'statorSlots', group: 'manualSpecificationData' });
      }
      if (manualSpecificationOptions.ampsLockedRotor) {
        fields.push({ display: 'Amps Locked Rotor', value: 'ampsLockedRotor', group: 'manualSpecificationData', unit: 'A' });
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
        fields.push({ display: 'Torque Break Down', value: 'torqueBreakDown', group: 'torqueData', unit: torqueUnit });
      }
      if (torqueOptions.torqueLockedRotor) {
        fields.push({ display: 'Torque Locked Rotor', value: 'torqueLockedRotor', group: 'torqueData', unit: torqueUnit });
      }
    }
    return fields;
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
}
