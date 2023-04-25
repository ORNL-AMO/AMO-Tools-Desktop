import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Settings } from '../shared/models/settings';
import { FieldMeasurements, PumpInventoryData, PumpInventoryDepartment, PumpItem, PumpPropertyDisplayOptions } from './pump-inventory';
import * as _ from 'lodash';

@Injectable()
export class PumpInventoryService {

  mainTab: BehaviorSubject<string>;
  setupTab: BehaviorSubject<string>;
  summaryTab: BehaviorSubject<string>;
  pumpInventoryData: BehaviorSubject<PumpInventoryData>;
  focusedField: BehaviorSubject<string>;
  focusedDataGroup: BehaviorSubject<string>;
  modalOpen: BehaviorSubject<boolean>;
  settings: BehaviorSubject<Settings>;
  helpPanelTab: BehaviorSubject<string>;

  filterInventorySummary: BehaviorSubject<FilterInventorySummary>;

  constructor() { 
    this.setupTab = new BehaviorSubject<string>('plant-setup');
    this.mainTab = new BehaviorSubject<string>('setup');
    let inventoryData: PumpInventoryData = this.initInventoryData();
    this.pumpInventoryData = new BehaviorSubject<PumpInventoryData>(inventoryData);
    this.focusedField = new BehaviorSubject<string>('default');
    this.focusedDataGroup = new BehaviorSubject<string>(undefined);
    this.modalOpen = new BehaviorSubject<boolean>(false);
    this.summaryTab = new BehaviorSubject<string>('overview');
    this.settings = new BehaviorSubject<Settings>(undefined);
    this.helpPanelTab = new BehaviorSubject<string>(undefined);
    this.filterInventorySummary = new BehaviorSubject({
      selectedDepartmentIds: new Array(),
      efficiencyClasses: new Array(),
      ratedPower: new Array(),
      ratedVoltage: new Array()
    });
  }

  updatePumpItem(selectedPump: PumpItem) {
    let pumpInventoryData: PumpInventoryData = this.pumpInventoryData.getValue();
    let selectedDepartmentIndex: number = pumpInventoryData.departments.findIndex(department => { return department.id == selectedPump.departmentId });
    let catalogItemIndex: number = pumpInventoryData.departments[selectedDepartmentIndex].catalog.findIndex(pumpItem => { return pumpItem.id == selectedPump.id; });
    pumpInventoryData.departments[selectedDepartmentIndex].catalog[catalogItemIndex] = selectedPump;
    this.pumpInventoryData.next(pumpInventoryData);
  }

  deletePumpItem(selectedPump: PumpItem) {
    let pumpInventoryData: PumpInventoryData = this.pumpInventoryData.getValue();
    let selectedDepartmentIndex: number = pumpInventoryData.departments.findIndex(department => { return department.id == selectedPump.departmentId });
    let pumpItemIndex: number = pumpInventoryData.departments[selectedDepartmentIndex].catalog.findIndex(pumpItem => {return pumpItem.id == selectedPump.id});
    pumpInventoryData.departments[selectedDepartmentIndex].catalog.splice(pumpItemIndex, 1);
    this.pumpInventoryData.next(pumpInventoryData);
  }

  initInventoryData(): PumpInventoryData {
    let initialDepartment: PumpInventoryDepartment = this.getNewDepartment(1);
    let displayOptions: PumpPropertyDisplayOptions = this.getDefaultDisplayOptions();
    return {
      departments: [initialDepartment],
      displayOptions: displayOptions
    }
  }
 

  getNewDepartment(departmentNum: number): PumpInventoryDepartment {
    let departmentId: string = Math.random().toString(36).substr(2, 9);
    let initPump: PumpItem = this.getNewPump(departmentId);
    return {
      name: 'Department ' + departmentNum,
      operatingHours: 8760,
      description: '',
      id: departmentId,
      catalog: [initPump]
    }
  }

  getNewPump(departmentId: string): PumpItem {
    return {
      id: Math.random().toString(36).substr(2, 9),
      departmentId: departmentId,
      suiteDbItemId: undefined,
      description: '',
      name: 'New Pump',
      fieldMeasurements: {
        pumpSpeed: undefined,
        yearlyOperatingHours: undefined,
        staticSuctionHead: undefined,
        staticDischargeHead: undefined,
        efficiency: undefined,
        assessmentDate: undefined,
        operatingFlowRate: undefined,
        operatingHead: undefined,
        measuredPower: undefined,
        measuredCurrent: undefined,
        measuredVoltage: undefined,
        system: undefined,
        location: undefined,
      },
      fluid: {
        fluidType: 'Water',
        fluidDensity: undefined
      },
      nameplateData: {
        manufacturer: undefined,
        model: undefined,
        serialNumber: undefined,
      },
      pumpEquipment: {
        pumpType: 0, 
        shaftOrientation: 0, 
        shaftSealType: 0, 
        numStages: undefined, 
        inletDiameter: undefined, 
        outletDiameter: undefined,
        maxWorkingPressure: undefined,
        maxAmbientTemperature: undefined, 
        maxSuctionLift: undefined, 
        displacement: undefined, 
        startingTorque: undefined,
        ratedSpeed: undefined, 
        impellerDiameter: undefined, 
        minFlowSize: undefined, 
        pumpSize: undefined, 
        designHead: undefined,
        designFlow: undefined,
        designEfficiency: undefined,
      },
      pumpMotor: {
        motorRPM: undefined,
        lineFrequency: 50,
        motorRatedPower: undefined,
        motorEfficiencyClass: 0,
        motorRatedVoltage: undefined,
        motorFullLoadAmps: undefined,
        motorEfficiency: undefined,
      },
      pumpStatus: {
        status: 0,
        priority: 0,
        yearInstalled: undefined,
      },
      systemProperties: {
        driveType: 0,
        flangeConnectionClass: 'Class A',
        flangeConnectionSize: undefined,
        componentId: undefined,
        system: undefined,
        location: undefined
      }
    }
  }

  getDefaultDisplayOptions(): PumpPropertyDisplayOptions {
    return {
      nameplateDataOptions: {
        displayNameplateData: true,
        manufacturer: true,
        model: true,
        serialNumber: false,
    },
    pumpStatusOptions: {
        displayPumpStatus: false,
        status: false,
        priority: false,
        yearInstalled: false,
    },
    pumpPropertiesOptions: {
        displayPumpProperties: true,
        pumpType: true, 
        shaftOrientation: false, 
        shaftSealType: false, 
        numStages: true, 
        inletDiameter: true, 
        outletDiameter: true,
        maxWorkingPressure: false,
        maxAmbientTemperature: false, 
        maxSuctionLift: false, 
        displacement: false, 
        startingTorque: false,
        ratedSpeed: false, 
        impellerDiameter: false, 
        minFlowSize: false, 
        pumpSize: false, 
        designHead: false,
        designFlow: false,
        designEfficiency: false,
      },
      fluidPropertiesOptions: {
        displayFluidProperties: true,
        fluidType: true,
        fluidDensity: true
      },
      systemPropertiesOptions: {
        displaySystemProperties: true,
        driveType: true,
        flangeConnectionClass: false,
        flangeConnectionSize: false,
        componentId: false,
        system: false,
        location: false
      },
      fieldMeasurementOptions: {
        displayFieldMeasurements: true,
        pumpSpeed: true,
        yearlyOperatingHours: true,
        staticSuctionHead: false,
        staticDischargeHead: false,
        efficiency: false,
        assessmentDate: false,
        operatingFlowRate: true,
        operatingHead: true,
        measuredPower: true,
        measuredCurrent: true,
        measuredVoltage: true,
        system: true,
        location: true,
      },
      pumpMotorPropertiesOptions: {
        displayPumpMotorProperties: true,
        motorRPM: true,
        lineFrequency: true,
        motorRatedPower: true,
        motorEfficiencyClass: true,
        motorRatedVoltage: true,
        motorFullLoadAmps: true,
        motorEfficiency: true,
      }
    }
  
  }

  filterPumpInventoryData(inventoryData: PumpInventoryData, filterInventorySummary: FilterInventorySummary): PumpInventoryData {
    let filteredInventoryData: PumpInventoryData = JSON.parse(JSON.stringify(inventoryData));
    // if (filterInventorySummary.selectedDepartmentIds.length != 0) {
    //   filteredInventoryData.departments = _.filter(filteredInventoryData.departments, (department) => {
    //     return _.find(filterInventorySummary.selectedDepartmentIds, (id) => { return department.id == id }) != undefined;
    //   });
    // }
    // if (filterInventorySummary.efficiencyClasses.length != 0) {
    //   filteredInventoryData.departments.forEach(department => {
    //     department.catalog = _.filter(department.catalog, (pumpItem) => {
    //       return _.includes(filterInventorySummary.manufacturer, pumpItem.nameplateData.manufacturer);
    //     })
    //   });
    // }
    // if (filterInventorySummary.ratedPower.length != 0) {
    //   filteredInventoryData.departments.forEach(department => {
    //     department.catalog = _.filter(department.catalog, (pumpItem) => {
    //       return _.includes(filterInventorySummary.ratedPower, pumpItem.nameplateData.ratedMotorPower);
    //     })
    //   });
    // }
    // if (filterInventorySummary.ratedVoltage.length != 0) {
    //   filteredInventoryData.departments.forEach(department => {
    //     department.catalog = _.filter(department.catalog, (pumpItem) => {
    //       return _.includes(filterInventorySummary.ratedVoltage, pumpItem.nameplateData.ratedVoltage);
    //     })
    //   });
    // }
    return filteredInventoryData;
  }

}


export interface FilterInventorySummary {
  selectedDepartmentIds: Array<string>,
  efficiencyClasses: Array<number>,
  ratedPower: Array<number>,
  ratedVoltage: Array<number>
}