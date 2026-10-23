import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { Settings } from '../shared/models/settings';
import { PumpInventoryData, PumpInventoryDepartment, PumpItem, PumpPropertyDisplayOptions, ValidPump } from './pump-inventory';
import * as _ from 'lodash';
import { PumpMotorIntegrationService } from '../shared/connected-inventory/pump-motor-integration.service';
import { FieldMeasurementsCatalogService } from './pump-inventory-setup/pump-catalog/field-measurements-catalog/field-measurements-catalog.service';
import { PumpEquipmentCatalogService } from './pump-inventory-setup/pump-catalog/pump-equipment-catalog/pump-equipment-catalog.service';
import { UntypedFormGroup } from '@angular/forms';
import { PumpMotorCatalogService } from './pump-inventory-setup/pump-catalog/pump-motor-catalog/pump-motor-catalog.service';
import { copyObject } from '../shared/helperFunctions';
import { PUMP_INVENTORY_MAIN_VIEWS, PUMP_INVENTORY_SETUP_GATED_VIEWS, PUMP_INVENTORY_SETUP_VIEWS, PUMP_INVENTORY_SUMMARY_VIEWS, PumpInventoryMainView, PumpInventorySetupView, PumpInventorySummaryView } from './pump-inventory.routing';
import { getMergedRouteData, getSteppedView, isMainTabAllowed } from '../shared/main-tab-routing/main-tab-routing';

@Injectable()
export class PumpInventoryService {

  mainTab: BehaviorSubject<PumpInventoryMainView>;
  setupTab: BehaviorSubject<PumpInventorySetupView>;
  summaryTab: BehaviorSubject<PumpInventorySummaryView>;
  pumpInventoryData: BehaviorSubject<PumpInventoryData>;
  focusedField: BehaviorSubject<string>;
  focusedDataGroup: BehaviorSubject<string>;
  modalOpen: BehaviorSubject<boolean>;
  settings: BehaviorSubject<Settings>;
  helpPanelTab: BehaviorSubject<string>;
  showExportModal: BehaviorSubject<boolean>;
  currentInventoryId: number;

  filterInventorySummary: BehaviorSubject<FilterInventorySummary>;

  constructor(
    private fieldCatalogService: FieldMeasurementsCatalogService,
    private motorCatalogService: PumpMotorCatalogService,
    private pumpEquipmentService: PumpEquipmentCatalogService,
    private pumpMotorIntegrationService: PumpMotorIntegrationService,
    private router: Router) {
    this.setupTab = new BehaviorSubject<PumpInventorySetupView>('plant-setup');
    this.mainTab = new BehaviorSubject<PumpInventoryMainView>('setup');
    let inventoryData: PumpInventoryData = this.initInventoryData();
    this.pumpInventoryData = new BehaviorSubject<PumpInventoryData>(inventoryData);
    this.focusedField = new BehaviorSubject<string>('default');
    this.focusedDataGroup = new BehaviorSubject<string>(undefined);
    this.modalOpen = new BehaviorSubject<boolean>(false);
    this.summaryTab = new BehaviorSubject<PumpInventorySummaryView>('overview');
    this.settings = new BehaviorSubject<Settings>(undefined);
    this.helpPanelTab = new BehaviorSubject<string>(undefined);
    this.showExportModal = new BehaviorSubject<boolean>(false);
    this.filterInventorySummary = new BehaviorSubject({
      selectedDepartmentIds: new Array(),
      pumpTypes: new Array(),
      motorRatedPowerValues: new Array(),
      statusValues: new Array()
    });
  }

  /**
   * Pushes the main, setup and summary tab values found in the route data into the tab subjects.
   * @param snapshot snapshot to walk down through its `firstChild` chain
   */
  syncTabsFromRoute(snapshot: ActivatedRouteSnapshot) {
    const data = getMergedRouteData<PumpInventoryMainView, PumpInventorySetupView, PumpInventorySummaryView>(snapshot);
    if (data.mainView && data.mainView !== this.mainTab.getValue()) {
      this.mainTab.next(data.mainView);
    }
    if (data.setupView && data.setupView !== this.setupTab.getValue()) {
      this.setupTab.next(data.setupView);
    }
    if (data.summaryView && data.summaryView !== this.summaryTab.getValue()) {
      this.summaryTab.next(data.summaryView);
    }
  }

  /**
   * Replaces the summary route with plant setup while the inventory is invalid, so Back does not return to it.
   */
  redirectInvalidSummary() {
    if (!isMainTabAllowed(PUMP_INVENTORY_SETUP_GATED_VIEWS, this.mainTab.getValue(), this.pumpInventoryData.getValue().isValid)) {
      this.router.navigate(['/pump-inventory', this.currentInventoryId, PUMP_INVENTORY_MAIN_VIEWS[0], PUMP_INVENTORY_SETUP_VIEWS[0]], { replaceUrl: true });
    }
  }

  /**
   * Opens a main tab on its last visited sub-tab.
   * @param tab `setup` or `summary`
   */
  goToMainTab(tab: PumpInventoryMainView) {
    if (tab === 'setup') {
      this.goToSetupTab(this.setupTab.getValue());
    } else {
      this.goToSummaryTab(this.summaryTab.getValue());
    }
  }

  goToSetupTab(tab: PumpInventorySetupView) {
    this.router.navigate(['/pump-inventory', this.currentInventoryId, 'setup', tab]);
  }

  goToSummaryTab(tab: PumpInventorySummaryView) {
    this.router.navigate(['/pump-inventory', this.currentInventoryId, 'summary', tab]);
  }

  continueMainTab() {
    this.stepMainTab(1);
  }

  backMainTab() {
    this.stepMainTab(-1);
  }

  continueSetupTab() {
    this.stepSetupTab(1);
  }

  backSetupTab() {
    this.stepSetupTab(-1);
  }

  continueSummaryTab() {
    this.stepSummaryTab(1);
  }

  backSummaryTab() {
    this.stepSummaryTab(-1);
  }

  private stepMainTab(offset: number) {
    const view: PumpInventoryMainView = getSteppedView(PUMP_INVENTORY_MAIN_VIEWS, this.mainTab.getValue(), offset);
    if (view) {
      this.goToMainTab(view);
    }
  }

  private stepSetupTab(offset: number) {
    const view: PumpInventorySetupView = getSteppedView(PUMP_INVENTORY_SETUP_VIEWS, this.setupTab.getValue(), offset);
    if (view) {
      this.goToSetupTab(view);
    }
  }

  private stepSummaryTab(offset: number) {
    const view: PumpInventorySummaryView = getSteppedView(PUMP_INVENTORY_SUMMARY_VIEWS, this.summaryTab.getValue(), offset);
    if (view) {
      this.goToSummaryTab(view);
    }
  }

  updatePumpItem(selectedPump: PumpItem) {
    let pumpInventoryData: PumpInventoryData = this.pumpInventoryData.getValue();
      let isValid: boolean = true;
      pumpInventoryData.departments.map(dept => {
        let isValidDepartment: boolean = true;
        dept.catalog.map(pumpItem => {
          if (selectedPump.id === pumpItem.id) {
            pumpItem = selectedPump;
          }
          let isValidPump = this.isPumpValid(pumpItem);
          pumpItem.validPump = isValidPump;
          if (!isValidPump.isValid) {
            isValid = false;
            isValidDepartment = false;
          }
        })
        dept.isValid = isValidDepartment;
      });
      pumpInventoryData.isValid = isValid;
    this.pumpInventoryData.next(pumpInventoryData);
  }

  async deletePumpItem(selectedPump: PumpItem) {
    let pumpInventoryData: PumpInventoryData = this.pumpInventoryData.getValue();
    let selectedDepartmentIndex: number = pumpInventoryData.departments.findIndex(department => { return department.id == selectedPump.departmentId });
    let pumpItemIndex: number = pumpInventoryData.departments[selectedDepartmentIndex].catalog.findIndex(pumpItem => {return pumpItem.id == selectedPump.id});
    pumpInventoryData.departments[selectedDepartmentIndex].catalog.splice(pumpItemIndex, 1);
    if (selectedPump.connectedItem) {
     await this.pumpMotorIntegrationService.removeMotorConnectedItem(selectedPump);
     pumpInventoryData.hasConnectedInventoryItems = false;
    }
    this.setIsValidInventory(pumpInventoryData);
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

  isPumpValid(pump: PumpItem): ValidPump {
    let pumpMotorForm: UntypedFormGroup = this.motorCatalogService.getFormFromPumpMotor(pump.pumpMotor);
    let fieldMeasurementsForm: UntypedFormGroup = this.fieldCatalogService.getFormFromFieldMeasurements(pump.fieldMeasurements, pump.pumpEquipment.pumpType);
    let equipmentForm: UntypedFormGroup = this.pumpEquipmentService.getFormFromPumpEquipmentProperties(pump.pumpEquipment);
    return {
      isValid: pumpMotorForm.valid && fieldMeasurementsForm.valid && equipmentForm.valid,
      pumpMotorValid: pumpMotorForm.valid,
      fieldMeasurementsValid: fieldMeasurementsForm.valid,
      equipmentValid: equipmentForm.valid
    }
  }

  setIsValidInventory(pumpInventoryData: PumpInventoryData) {
    let isValid: boolean = true;
    if (pumpInventoryData) {
      pumpInventoryData.departments.forEach(dept => {
        let isValidDepartment: boolean = true;
        dept.catalog.map(pumpItem => {
          pumpItem.validPump = this.isPumpValid(pumpItem);
          if (!pumpItem.validPump.isValid) {
            isValid = false;
            isValidDepartment = false;
          }
        })
        dept.isValid = isValidDepartment
      });
    }
    pumpInventoryData.isValid = isValid;
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
      notes: '',
      name: 'New Pump',
      fieldMeasurements: {
        pumpSpeed: undefined,
        yearlyOperatingHours: undefined,
        staticSuctionHead: undefined,
        staticDischargeHead: undefined,
        efficiency: undefined,
        assessmentDate: undefined,
        operatingFlowRate: undefined,
        loadEstimationMethod: 1,
        operatingHead: undefined,
        operatingDifferentialPressure: undefined,
        measuredPower: undefined,
        measuredCurrent: undefined,
        measuredVoltage: undefined,
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
        designDifferentialPressure: undefined,
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
        system: true,
        location: true
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
    let filteredInventoryData: PumpInventoryData = copyObject(inventoryData);
    if (filterInventorySummary.selectedDepartmentIds.length != 0) {
      filteredInventoryData.departments = _.filter(filteredInventoryData.departments, (department) => {
        return _.find(filterInventorySummary.selectedDepartmentIds, (id) => { return department.id == id }) != undefined;
      });
    }
    if (filterInventorySummary.pumpTypes.length != 0) {
      filteredInventoryData.departments.forEach(department => {
        department.catalog = _.filter(department.catalog, (pumpItem) => {
          return _.includes(filterInventorySummary.pumpTypes, pumpItem.pumpEquipment.pumpType);
        })
      });
    }
    if (filterInventorySummary.motorRatedPowerValues.length != 0) {
      filteredInventoryData.departments.forEach(department => {
        department.catalog = _.filter(department.catalog, (pumpItem) => {
          return _.includes(filterInventorySummary.motorRatedPowerValues, pumpItem.pumpMotor.motorRatedPower);
        })
      });
    }
    if (filterInventorySummary.statusValues.length != 0) {
      filteredInventoryData.departments.forEach(department => {
        department.catalog = _.filter(department.catalog, (pumpItem) => {
          return _.includes(filterInventorySummary.statusValues, pumpItem.pumpStatus.status);
        })
      });
    }
    return filteredInventoryData;
  }

}


export interface FilterInventorySummary {
  selectedDepartmentIds: Array<string>,
  pumpTypes: Array<number>,
  motorRatedPowerValues: Array<number>,
  statusValues: Array<number>
}


export const pumpInventoryDriveConstants: Array<{value: number, display: string}> = [
  {value: 0, display: 'Direct Drive'}, 
  {value: 1, display: 'VSD'}, 
  {value: 2, display: 'Belt Drive'}, 
  {value: 3, display: 'Gear Box/Transmission'}, 
];

export const pumpInventoryShaftOrientations: Array<{value: number, display: string}> = [
  {value: 0, display: 'Vertical'}, 
  {value: 1, display: 'Horizontal'}, 
];

export const pumpInventoryShaftSealTypes: Array<{value: number, display: string}> = [
  {value: 0, display: 'Parking Seals'}, 
  {value: 1, display: 'Mechanical Seals'}, 
];