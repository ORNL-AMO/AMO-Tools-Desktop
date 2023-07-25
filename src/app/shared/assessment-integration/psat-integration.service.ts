import { Injectable } from '@angular/core';
import { Assessment } from '../models/assessment';
import { AssessmentOption, ConnectedInventoryData, ConnectedItem, ConnectedValueFormField, IntegrationState, InventoryOption } from './integrations';
import { PSAT, PsatInputs } from '../models/psat';
import { PumpInventoryDepartment, PumpItem, PumpMotorProperties } from '../../pump-inventory/pump-inventory';
import { InventoryItem } from '../models/inventory/inventory';
import { firstValueFrom } from 'rxjs';
import { InventoryDbService } from '../../indexedDb/inventory-db.service';
import { AssessmentDbService } from '../../indexedDb/assessment-db.service';
import * as _ from 'lodash';
import { IntegrationStateService } from './integration-state.service';
import { HelperFunctionsService } from '../helper-services/helper-functions.service';
import { SettingsDbService } from '../../indexedDb/settings-db.service';
import { Settings } from '../models/settings';
import { ConvertUnitsService } from '../convert-units/convert-units.service';
import { SettingsService } from '../../settings/settings.service';
import { PsatService } from '../../psat/psat.service';
import { PumpInventoryService } from '../../pump-inventory/pump-inventory.service';

@Injectable()
export class PsatIntegrationService {

  pumpAssessments: Array<Assessment> = [];
  pumpAssessmentOptions: Array<AssessmentOption>;
  constructor(private assessmentDbService: AssessmentDbService,
    private integrationStateService: IntegrationStateService,
    private inventoryDbService: InventoryDbService,
    private helperService: HelperFunctionsService,
    private settingsDbService: SettingsDbService,
    private psatService: PsatService,
    private pumpInventoryService: PumpInventoryService,
    private settingsService: SettingsService,
    private convertUnitsService: ConvertUnitsService
  ) { }

  async initAssessmentsAndOptions() {
    let allAssessments: Array<Assessment> = await firstValueFrom(this.assessmentDbService.getAllAssessments());
    this.assessmentDbService.setAll(allAssessments);
    let pumpAssessments = allAssessments.filter(assessment => { return assessment.type == "PSAT" });
    this.pumpAssessments = (_.orderBy(pumpAssessments, 'modifiedDate'));

    this.pumpAssessmentOptions = this.pumpAssessments.map(assessment => { return { display: assessment.name, id: assessment.id } });
    this.pumpAssessmentOptions.unshift({ display: 'Select Assessment', id: null });
    return this.pumpAssessmentOptions;
  }

  async initInventoriesAndOptions(): Promise<Array<InventoryOption>> {
    let allInventories: Array<InventoryItem> = await firstValueFrom(this.inventoryDbService.getAllInventory());
    this.inventoryDbService.setAll(allInventories);
    let pumpInventories: Array<InventoryItem> = allInventories.filter(inventory => inventory.pumpInventoryData);
    pumpInventories = (_.orderBy(pumpInventories, 'modifiedDate'));

    let pumpInventoryOptions: Array<InventoryOption> = pumpInventories.map(inventory => {
      let catalogItemOptions = inventory.pumpInventoryData.departments.map(department => {
        let orderedCatalog = (_.orderBy(department.catalog, (item) => item.pumpMotor.motorRatedPower, ['asc']));
        return {
          department: department.name,
          catalog: orderedCatalog
        }
      });

      let inventoryOption: InventoryOption = {
        display: inventory.name,
        id: inventory.id,
        catalogItemOptions: catalogItemOptions
      }

      return inventoryOption;
    });
    return pumpInventoryOptions;
  }

  // * take separate assessment, psat args so _psat can be saved to assessment in psat.component
  async setPSATFromExistingPumpItem(connectedInventoryData: ConnectedInventoryData, assessmentPsat: PSAT, assessment: Assessment, newAssessmentSettings?: Settings) {
    let assessmentIntegrationState: IntegrationState = {
      assessmentIntegrationStatus: undefined,
      msgHTML: undefined
    }
    let pumpInventory: InventoryItem = this.inventoryDbService.getById(connectedInventoryData.connectedItem.inventoryId);
    let pumpInventorySettings: Settings = this.settingsDbService.getByInventoryId(pumpInventory);
    let selectedPumpItem: PumpItem = this.getConnectedPumpItem(connectedInventoryData.connectedItem);
    let psat: PSAT = assessmentPsat;

    if (selectedPumpItem.validPump && !selectedPumpItem.validPump.isValid) {
      assessmentIntegrationState.assessmentIntegrationStatus = 'invalid';
      assessmentIntegrationState.msgHTML = `<b>${selectedPumpItem.name}</b> is invalid. Verify pump catalog data and try again.`;
      connectedInventoryData.canConnect = false;
      this.integrationStateService.assessmentIntegrationState.next(assessmentIntegrationState);
    } else {
      connectedInventoryData.canConnect = true;
      if (newAssessmentSettings) {
        newAssessmentSettings.unitsOfMeasure = pumpInventorySettings.unitsOfMeasure;
      } else {
        let assessmentSettings: Settings = this.settingsDbService.getByAssessmentId(assessment, true);
        if (pumpInventorySettings.unitsOfMeasure !== assessmentSettings.unitsOfMeasure) {
          if (connectedInventoryData.shouldConvertItemUnits) {
            connectedInventoryData.shouldConvertItemUnits = false;
            // * convert to handle all non integrated fields, let selectedPumpItem assignments take care of the rest
            psat = this.psatService.convertExistingData(psat, assessmentSettings, pumpInventorySettings);

            // * convert to pump inventory settings
            let assessmentSettingsId: number = assessmentSettings.id;
            let assessmentId: number = assessmentSettings.assessmentId;
            assessmentSettings.unitsOfMeasure = pumpInventorySettings.unitsOfMeasure
            let settingsForm = this.settingsService.getFormFromSettings(assessmentSettings);
            settingsForm = this.settingsService.setUnits(settingsForm);
            assessmentSettings = this.settingsService.getSettingsFromForm(settingsForm);
            assessmentSettings.id = assessmentSettingsId;
            assessmentSettings.assessmentId = assessmentId;

            await firstValueFrom(this.settingsDbService.updateWithObservable(assessmentSettings));
            let allSettings: Settings[] = await firstValueFrom(this.settingsDbService.getAllSettings());  
            this.settingsDbService.setAll(allSettings);
            connectedInventoryData.canConnect = true;
          } else {
            assessmentIntegrationState.assessmentIntegrationStatus = 'settings-differ';
            assessmentIntegrationState.msgHTML = `Selected units of measure for inventory <b>${pumpInventory.name}</b> differ from this assessment`;
            connectedInventoryData.canConnect = false;
          }
          this.integrationStateService.assessmentIntegrationState.next(assessmentIntegrationState);
        }
      }
    }

    if (connectedInventoryData.canConnect) {
      psat.inputs.pump_style = selectedPumpItem.pumpEquipment.pumpType;
      psat.inputs.pump_rated_speed = selectedPumpItem.fieldMeasurements.pumpSpeed;
      psat.inputs.drive = selectedPumpItem.systemProperties.driveType;
      psat.inputs.stages = selectedPumpItem.pumpEquipment.numStages;
      // changeLineFreq - motor.comp autmatic changes to motor_rated_speed below?
      psat.inputs.line_frequency = selectedPumpItem.pumpMotor.lineFrequency;
      psat.inputs.motor_rated_power = selectedPumpItem.pumpMotor.motorRatedPower;
      psat.inputs.motor_rated_speed = selectedPumpItem.pumpMotor.motorRPM;
      psat.inputs.efficiency_class = selectedPumpItem.pumpMotor.motorEfficiencyClass;
      psat.inputs.efficiency = selectedPumpItem.pumpMotor.motorEfficiency;
      psat.inputs.motor_rated_voltage = selectedPumpItem.pumpMotor.motorRatedVoltage;
      psat.inputs.motor_rated_fla = selectedPumpItem.pumpMotor.motorFullLoadAmps;
      psat.inputs.operating_hours = selectedPumpItem.fieldMeasurements.yearlyOperatingHours;
      psat.inputs.flow_rate = selectedPumpItem.fieldMeasurements.operatingFlowRate;
      psat.inputs.head = selectedPumpItem.fieldMeasurements.operatingHead;
      psat.inputs.load_estimation_method = selectedPumpItem.fieldMeasurements.loadEstimationMethod;
      psat.inputs.motor_field_power = selectedPumpItem.fieldMeasurements.measuredPower;
      psat.inputs.motor_field_current = selectedPumpItem.fieldMeasurements.measuredCurrent;
      psat.inputs.motor_field_voltage = selectedPumpItem.fieldMeasurements.measuredVoltage;
      // calculatespecifiedGravity 
      psat.inputs.fluidType = selectedPumpItem.fluid.fluidType;

      let pumpInventory: InventoryItem = this.inventoryDbService.getById(connectedInventoryData.connectedItem.inventoryId);
      connectedInventoryData.ownerAssessmentId = assessment.id;
      connectedInventoryData.isConnected = true;
      connectedInventoryData.canConnect = false;
      connectedInventoryData.connectedItem.assessmentId = assessment.id;

      psat.connectedItem = connectedInventoryData.connectedItem;
      assessment.psat.inputs = psat.inputs;
      assessmentPsat.inputs = psat.inputs;

      if (selectedPumpItem.connectedItem) {
        let assessmentIntegrationState = this.integrationStateService.assessmentIntegrationState.getValue();
        assessmentIntegrationState.hasThreeWayConnection = true;
        this.integrationStateService.assessmentIntegrationState.next(assessmentIntegrationState);
      }

      pumpInventory.pumpInventoryData.departments.forEach(dept => {
        dept.catalog.map(pumpItem => {
          if (pumpItem.id === connectedInventoryData.connectedItem.id) {
            let connectedFromState = this.helperService.copyObject(selectedPumpItem);
            let connectedAsssessment: ConnectedItem = {
              assessmentId: assessment.id,
              name: assessment.name,
              inventoryId: connectedInventoryData.connectedItem.inventoryId,
              connectedFromState: {
                pumpMotor: connectedFromState.pumpMotor,
                pumpEquipment: connectedFromState.pumpEquipment,
                pumpSystem: connectedFromState.systemProperties,
                pumpFluid: connectedFromState.fluid,
              }
            }
            if (pumpItem.connectedAssessments) {
              pumpItem.connectedAssessments.push(connectedAsssessment);
            } else {
              pumpItem.connectedAssessments = [connectedAsssessment];
            }
          }
        })
      });

      await firstValueFrom(this.inventoryDbService.updateWithObservable(pumpInventory));
      let updatedInventoryItems: InventoryItem[] = await firstValueFrom(this.inventoryDbService.getAllInventory());
      this.inventoryDbService.setAll(updatedInventoryItems);
      this.integrationStateService.connectedInventoryData.next(connectedInventoryData);
    }
  }

  setPumpConnectedInventoryData(assessment: Assessment) {
    let connectedInventoryData: ConnectedInventoryData = this.integrationStateService.getEmptyConnectedInventoryData();
    let assessmentIntegrationState = this.integrationStateService.assessmentIntegrationState.getValue();
    if (assessment.psat.connectedItem) {
      let connectedPumpItem = this.getConnectedPumpItem(assessment.psat.connectedItem);
      if (connectedPumpItem) {
        connectedInventoryData.connectedItem = assessment.psat.connectedItem;
        connectedInventoryData.isConnected = true;
        this.integrationStateService.connectedInventoryData.next(connectedInventoryData);
        if (connectedPumpItem.connectedItem && connectedPumpItem.connectedAssessments) {
          assessmentIntegrationState.hasThreeWayConnection = true;
          this.integrationStateService.assessmentIntegrationState.next(assessmentIntegrationState);
        }
      } else {
        // item was deleted
        delete assessment.psat.connectedItem;
        this.integrationStateService.assessmentIntegrationState.next(assessmentIntegrationState);
      }
    }
  }

  getHasConnectedPSAT(inventoryItem: InventoryItem) {
    return inventoryItem.pumpInventoryData.departments.some(department => {
      return department.catalog.some(item => item.connectedAssessments && item.connectedAssessments.length != 0);
    }
    );
  }

  async removeConnectedInventory(connectedItem: ConnectedItem, ownerAssessmentId: number) {
    let pumpInventory: InventoryItem = this.inventoryDbService.getById(connectedItem.inventoryId);
    pumpInventory.pumpInventoryData.departments.forEach(dept => {
      dept.catalog.map(pumpItem => {
        if (pumpItem.id === connectedItem.id && pumpItem.connectedAssessments) {
          let connectedPumpIndex = pumpItem.connectedAssessments.findIndex(item => item.assessmentId === ownerAssessmentId);
          pumpItem.connectedAssessments.splice(connectedPumpIndex, 1);
          if (pumpItem.connectedAssessments.length === 0) {
            pumpItem.connectedAssessments = undefined;
          }
        }
      });
    });

    await firstValueFrom(this.inventoryDbService.updateWithObservable(pumpInventory));
    let updatedInventoryItems: InventoryItem[] = await firstValueFrom(this.inventoryDbService.getAllInventory());
    this.inventoryDbService.setAll(updatedInventoryItems);
    this.integrationStateService.connectedInventoryData.next(this.integrationStateService.getEmptyConnectedInventoryData());
    this.integrationStateService.assessmentIntegrationState.next(this.integrationStateService.getEmptyIntegrationState());
  }


  checkConnectedAssessmentDiffers(selectedPump: PumpItem) {
    let differingConnectedValues: Array<ConnectedValueFormField> = [];
    let differingAssessments: Array<ConnectedItem> = selectedPump.connectedAssessments.filter((connectedAssessment: ConnectedItem) => {
      let assessment = this.assessmentDbService.findById(connectedAssessment.assessmentId);
      let assessmentSettings = this.settingsDbService.getByAssessmentId(assessment, true);
      let pumpInventory: InventoryItem = this.inventoryDbService.getById(connectedAssessment.inventoryId);
      let pumpInventorySettings: Settings = this.settingsDbService.getByInventoryId(pumpInventory);
      let settingsDiffer: boolean = assessmentSettings.unitsOfMeasure !== pumpInventorySettings.unitsOfMeasure;
      let isMotorMatch = Object.keys(selectedPump.pumpMotor).every((key, index) => {
        let newValue = selectedPump.pumpMotor[key];
        let connectedFromValue = connectedAssessment.connectedFromState.pumpMotor[key];
        if (settingsDiffer && key === 'motorRatedPower') {
          let assessmentUnit: string = assessmentSettings.unitsOfMeasure === 'Imperial' ? 'hp' : 'kW';
          let inventoryUnit: string = pumpInventorySettings.unitsOfMeasure === 'Imperial' ? 'hp' : 'kW';
          connectedFromValue = this.convertUnitsService.value(connectedFromValue).from(assessmentUnit).to(inventoryUnit);
          connectedFromValue = this.convertUnitsService.roundVal(connectedFromValue, 2)
        }
        let valuesEqual: boolean = newValue === connectedFromValue;
        if (!valuesEqual) {
          let motorField: ConnectedValueFormField = {
            formGroup: 'motor',
          }
          differingConnectedValues.push(motorField);
        }
        return valuesEqual;
      });

      let isFluidMatch: boolean = true;
      let isEquipmentMatch: boolean = true;
      let isSystemPropertiesMatch: boolean = true;
      if (selectedPump.fluid.fluidType !== connectedAssessment.connectedFromState.pumpFluid.fluidType) {
        isFluidMatch = false;
        let fluidFormField: ConnectedValueFormField = {
          formGroup: 'fluid',
        }
        differingConnectedValues.push(fluidFormField);
      }

      if (selectedPump.pumpEquipment.numStages !== connectedAssessment.connectedFromState.pumpEquipment.numStages
        || selectedPump.pumpEquipment.pumpType !== connectedAssessment.connectedFromState.pumpEquipment.pumpType) {
        isEquipmentMatch = false;
        let numStagesField: ConnectedValueFormField = {
          formGroup: 'pump',
        }
        differingConnectedValues.push(numStagesField);
      }

      if (selectedPump.systemProperties.driveType !== connectedAssessment.connectedFromState.pumpSystem.driveType) {
        isSystemPropertiesMatch = false;
        let driveTypeField: ConnectedValueFormField = {
          formGroup: 'system',
        }
        differingConnectedValues.push(driveTypeField);
      }
      return !(isMotorMatch && isFluidMatch && isEquipmentMatch && isSystemPropertiesMatch);
    });

    this.setConnectionDiffers(differingAssessments.length !== 0, differingConnectedValues);
  }

  checkConnectedInventoryDiffers(assessment: Assessment) {
    let differingConnectedValues: Array<ConnectedValueFormField> = [];
    let connectedPumpItem: PumpItem = this.getConnectedPumpItem(assessment.psat.connectedItem);
    if (connectedPumpItem && connectedPumpItem.connectedAssessments) {
      let currentAssessment = connectedPumpItem.connectedAssessments.find((connectedAssessment: ConnectedItem) => {
        return connectedAssessment.assessmentId === assessment.id;
      });

      if (currentAssessment) {
        let psatMotor: PumpMotorProperties = {
          lineFrequency: assessment.psat.inputs.line_frequency,
          motorRatedPower: assessment.psat.inputs.motor_rated_power,
          motorRPM: assessment.psat.inputs.motor_rated_speed,
          motorEfficiencyClass: assessment.psat.inputs.efficiency_class,
          motorEfficiency: assessment.psat.inputs.efficiency,
          motorRatedVoltage: assessment.psat.inputs.motor_rated_voltage,
          motorFullLoadAmps: assessment.psat.inputs.motor_rated_fla,
        }

        Object.keys(psatMotor).every((key, index) => {
          const newValue = psatMotor[key];
          const connectedFromValue = currentAssessment.connectedFromState.pumpMotor[key];
          let valuesEqual: boolean = newValue === connectedFromValue;
          if (!valuesEqual) {
            let motorField: ConnectedValueFormField = {
              formGroup: 'motor',
            }
            differingConnectedValues.push(motorField);
          }
          return valuesEqual;
        });

        if (assessment.psat.inputs.fluidType !== currentAssessment.connectedFromState.pumpFluid.fluidType
          || assessment.psat.inputs.stages !== currentAssessment.connectedFromState.pumpEquipment.numStages) {
          let fluidFormField: ConnectedValueFormField = {
            formGroup: 'fluid',
          }
          differingConnectedValues.push(fluidFormField);
        }

        if (assessment.psat.inputs.pump_style !== currentAssessment.connectedFromState.pumpEquipment.pumpType ||
          assessment.psat.inputs.drive !== currentAssessment.connectedFromState.pumpSystem.driveType) {
          let numStagesField: ConnectedValueFormField = {
            formGroup: 'pump',
          }
          differingConnectedValues.push(numStagesField);
        }
      }
    }
    this.setConnectionDiffers(differingConnectedValues.length !== 0, differingConnectedValues);
  }

  setConnectionDiffers(connectionDiffers: boolean, differingConnectedValues: Array<ConnectedValueFormField>) {
    let integrationState: IntegrationState = this.integrationStateService.assessmentIntegrationState.getValue();
    if (connectionDiffers) {
      integrationState.assessmentIntegrationStatus = 'connected-assessment-differs'
      integrationState.differingConnectedValues = differingConnectedValues
      integrationState.msgHTML = undefined
    } else {
      integrationState.assessmentIntegrationStatus = undefined
      integrationState.differingConnectedValues = differingConnectedValues
      integrationState.msgHTML = undefined
    }
    this.integrationStateService.assessmentIntegrationState.next(integrationState);
  }

  getConnectedPumpItem(connectedItem: ConnectedItem) {
    let pumpItem: PumpItem;
    let inventoryItem: InventoryItem = this.inventoryDbService.getById(connectedItem.inventoryId);
    if (inventoryItem) {
      let department: PumpInventoryDepartment = inventoryItem.pumpInventoryData.departments.find(department => department.id === connectedItem.departmentId);
      if (department) {
        pumpItem = department.catalog.find(pumpItem => pumpItem.id === connectedItem.id);
        pumpItem.validPump = this.pumpInventoryService.isPumpValid(pumpItem);
      }
    }
    return pumpItem;
  }

  restoreConnectedAssessmentValues(connectedInventoryData: ConnectedInventoryData, psat: PSAT): PSAT {
    // * we don't care which connected assessment
    let connectedPumpItem: PumpItem = this.getConnectedPumpItem(psat.connectedItem);
    let currentAssessment = connectedPumpItem.connectedAssessments.find((connectedAssessment: ConnectedItem) => {
      return connectedAssessment.assessmentId === psat.connectedItem.assessmentId;
    });

    console.log(currentAssessment.connectedFromState.pumpMotor)
    psat.inputs.pump_style = currentAssessment.connectedFromState.pumpEquipment.pumpType;
    psat.inputs.drive = currentAssessment.connectedFromState.pumpSystem.driveType;
    psat.inputs.stages = currentAssessment.connectedFromState.pumpEquipment.numStages;
    psat.inputs.line_frequency = currentAssessment.connectedFromState.pumpMotor.lineFrequency;
    psat.inputs.motor_rated_power = currentAssessment.connectedFromState.pumpMotor.motorRatedPower;
    psat.inputs.motor_rated_speed = currentAssessment.connectedFromState.pumpMotor.motorRPM;
    psat.inputs.efficiency_class = currentAssessment.connectedFromState.pumpMotor.motorEfficiencyClass;
    psat.inputs.efficiency = currentAssessment.connectedFromState.pumpMotor.motorEfficiency;
    psat.inputs.motor_rated_voltage = currentAssessment.connectedFromState.pumpMotor.motorRatedVoltage;
    psat.inputs.motor_rated_fla = currentAssessment.connectedFromState.pumpMotor.motorFullLoadAmps;
    psat.inputs.fluidType = currentAssessment.connectedFromState.pumpFluid.fluidType;

    connectedInventoryData.shouldRestoreConnectedValues = false;
    this.integrationStateService.connectedInventoryData.next(connectedInventoryData);
    return psat;
  }

  restoreConnectedInventoryValues(selectedPump: PumpItem, connectedInventoryData: ConnectedInventoryData) {
    // * we don't care which connected assessment
    let currentAssessment = selectedPump.connectedAssessments[0];
    selectedPump.pumpEquipment.pumpType = currentAssessment.connectedFromState.pumpEquipment.pumpType;
    selectedPump.systemProperties.driveType = currentAssessment.connectedFromState.pumpSystem.driveType;
    selectedPump.pumpEquipment.numStages = currentAssessment.connectedFromState.pumpEquipment.numStages;
    selectedPump.pumpMotor.lineFrequency = currentAssessment.connectedFromState.pumpMotor.lineFrequency;
    selectedPump.pumpMotor.motorRatedPower = currentAssessment.connectedFromState.pumpMotor.motorRatedPower;
    selectedPump.pumpMotor.motorRPM = currentAssessment.connectedFromState.pumpMotor.motorRPM;
    selectedPump.pumpMotor.motorEfficiencyClass = currentAssessment.connectedFromState.pumpMotor.motorEfficiencyClass;
    selectedPump.pumpMotor.motorEfficiency = currentAssessment.connectedFromState.pumpMotor.motorEfficiency;
    selectedPump.pumpMotor.motorRatedVoltage = currentAssessment.connectedFromState.pumpMotor.motorRatedVoltage;
    selectedPump.pumpMotor.motorFullLoadAmps = currentAssessment.connectedFromState.pumpMotor.motorFullLoadAmps;
    selectedPump.fluid.fluidType = currentAssessment.connectedFromState.pumpFluid.fluidType;
    connectedInventoryData.shouldRestoreConnectedValues = false;
    this.integrationStateService.connectedInventoryData.next(connectedInventoryData)
  }

}


export interface PsatIntegrationResult {
  connectedItem: PumpItem,
  psatInputs?: PsatInputs
}