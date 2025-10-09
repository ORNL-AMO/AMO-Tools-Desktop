import { Injectable } from '@angular/core';
import { Assessment } from '../models/assessment';
import { AssessmentOption, ConnectedInventoryData, ConnectedItem, ConnectedValueFormField, IntegrationState, InventoryOption } from './integrations';
import { InventoryItem } from '../models/inventory/inventory';
import { firstValueFrom } from 'rxjs';
import { InventoryDbService } from '../../indexedDb/inventory-db.service';
import { AssessmentDbService } from '../../indexedDb/assessment-db.service';
import * as _ from 'lodash';
import { IntegrationStateService } from './integration-state.service';
import { SettingsDbService } from '../../indexedDb/settings-db.service';
import { Settings } from '../models/settings';
import { ConvertUnitsService } from '../convert-units/convert-units.service';
import { SettingsService } from '../../settings/settings.service';
import { MotorInventoryDepartment, MotorItem } from '../../motor-inventory/motor-inventory';
import { ConvertMotorInventoryService } from '../../motor-inventory/convert-motor-inventory.service';
import { copyObject } from '../helperFunctions';
import { CompressedAirMotorIntegrationService } from './compressed-air-motor-integration.service';
import { CompressedAirInventoryService } from '../../compressed-air-inventory/compressed-air-inventory.service';
import { CompressedAirAssessmentService } from '../../compressed-air-assessment/compressed-air-assessment.service';
import { CompressedAirAssessment, CompressorInventoryItem, SystemInformation } from '../models/compressed-air-assessment';
import { CompressedAirInventorySystem, CompressedAirItem, CompressedAirMotorProperties } from '../../compressed-air-inventory/compressed-air-inventory';

@Injectable()
export class CompressedAirAssessmentIntegrationService {

    compressedAirAssessments: Array<Assessment> = [];
    compressedAirAssessmentOptions: Array<AssessmentOption>;
    constructor(private assessmentDbService: AssessmentDbService,
        private integrationStateService: IntegrationStateService,
        private inventoryDbService: InventoryDbService,
        private settingsDbService: SettingsDbService,
        private convertMotorInventoryService: ConvertMotorInventoryService,
        private settingsService: SettingsService,
        private convertUnitsService: ConvertUnitsService,
        private compressedAirMotorIntegrationService: CompressedAirMotorIntegrationService,
        private compressedAirInventoryService: CompressedAirInventoryService,
        private compressedAirAssessmentService: CompressedAirAssessmentService,
    ) { }

    async initAssessmentsAndOptions() {
        let allAssessments: Array<Assessment> = await firstValueFrom(this.assessmentDbService.getAllAssessments());
        this.assessmentDbService.setAll(allAssessments);
        let compressedAirAssessments = allAssessments.filter(assessment => { return assessment.type == "CompressedAir" });
        this.compressedAirAssessments = (_.orderBy(compressedAirAssessments, 'modifiedDate'));

        this.compressedAirAssessmentOptions = this.compressedAirAssessments.map(assessment => { return { display: assessment.name, id: assessment.id } });
        this.compressedAirAssessmentOptions.unshift({ display: 'Select Assessment', id: null });
        return this.compressedAirAssessmentOptions;
    }

    async initInventoriesAndOptions(): Promise<Array<InventoryOption>> {
        let allInventories: Array<InventoryItem> = await firstValueFrom(this.inventoryDbService.getAllInventory());
        this.inventoryDbService.setAll(allInventories);
        let compressedAirInventories: Array<InventoryItem> = allInventories.filter(inventory => inventory.compressedAirInventoryData);
        compressedAirInventories = (_.orderBy(compressedAirInventories, 'modifiedDate'));

        let compressedAirInventoryOptions: Array<InventoryOption> = compressedAirInventories.map(inventory => {
            let catalogItemOptions = [{
                department: 'Compressed Air Systems',
                catalog: inventory.compressedAirInventoryData.systems
            }];

            let inventoryOption: InventoryOption = {
                display: inventory.name,
                id: inventory.id,
                catalogItemOptions: catalogItemOptions
            }

            return inventoryOption;
        });
        return compressedAirInventoryOptions;
    }

    // * take separate assessment, compressedAirAssessment args so _compressedAirAssessment can be saved to assessment in compressedAirAssessment.component
    async setCompressedAirAssessmentFromExistingCompressedAirItem(connectedInventoryData: ConnectedInventoryData, assessmentCompressedAirAssessment: CompressedAirAssessment, assessment: Assessment, newAssessmentSettings?: Settings) {
        let connectedAssessmentState: IntegrationState = {
            connectedAssessmentStatus: undefined,
            msgHTML: undefined
        }
        let compressedAirInventory: InventoryItem = this.inventoryDbService.getById(connectedInventoryData.connectedItem.inventoryId);
        let compressedAirInventorySettings: Settings = this.settingsDbService.getByInventoryId(compressedAirInventory);
        let selectedCompressedAirSystem: CompressedAirInventorySystem = this.getConnectedCompressedAirItem(connectedInventoryData.connectedItem);
        let compressedAirAssessment: CompressedAirAssessment = assessmentCompressedAirAssessment;

        selectedCompressedAirSystem.isValid = this.compressedAirInventoryService.setIsValidSystem(compressedAirInventory.compressedAirInventoryData, selectedCompressedAirSystem);
        if (!selectedCompressedAirSystem.isValid) {
            connectedAssessmentState.connectedAssessmentStatus = 'invalid';
            connectedAssessmentState.msgHTML = `<b>${selectedCompressedAirSystem.name}</b> is invalid. Verify compressedAir catalog data and try again.`;
            connectedInventoryData.canConnect = false;
            this.integrationStateService.connectedAssessmentState.next(connectedAssessmentState);
        } else {
            connectedInventoryData.canConnect = true;
            if (newAssessmentSettings) {
                newAssessmentSettings.unitsOfMeasure = compressedAirInventorySettings.unitsOfMeasure;
            } else {
                let assessmentSettings: Settings = this.settingsDbService.getByAssessmentId(assessment, true);
                if (compressedAirInventorySettings.unitsOfMeasure !== assessmentSettings.unitsOfMeasure) {
                    if (connectedInventoryData.shouldConvertItemUnits) {
                        connectedInventoryData.shouldConvertItemUnits = false;
                        // * convert to compressedAir inventory settings
                        let assessmentSettingsId: number = assessmentSettings.id;
                        let assessmentId: number = assessmentSettings.assessmentId;
                        assessmentSettings.unitsOfMeasure = compressedAirInventorySettings.unitsOfMeasure
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
                        connectedAssessmentState.connectedAssessmentStatus = 'settings-differ';
                        connectedAssessmentState.msgHTML = `Selected units of measure for inventory <b>${compressedAirInventory.name}</b> differ from this assessment`;
                        connectedInventoryData.canConnect = false;
                    }
                    this.integrationStateService.connectedAssessmentState.next(connectedAssessmentState);
                }
            }
        }

        if (connectedInventoryData.canConnect) {

            selectedCompressedAirSystem.catalog.forEach(item => {
                console.log('item', item);
                let compressorInventoryItem: CompressorInventoryItem = this.getNewInventoryItem();

                compressorInventoryItem.name = item.name;

                compressorInventoryItem.nameplateData.compressorType = item.nameplateData.compressorType;
                compressorInventoryItem.nameplateData.fullLoadOperatingPressure = item.nameplateData.fullLoadOperatingPressure;
                compressorInventoryItem.nameplateData.fullLoadRatedCapacity = item.nameplateData.fullLoadRatedCapacity;
                compressorInventoryItem.nameplateData.totalPackageInputPower = item.nameplateData.totalPackageInputPower;

                compressorInventoryItem.nameplateData.motorPower = item.compressedAirMotor.motorPower;
                compressorInventoryItem.nameplateData.fullLoadAmps = item.compressedAirMotor.motorFullLoadAmps;

                compressorInventoryItem.compressorControls.controlType = item.compressedAirControlsProperties.controlType;
                compressorInventoryItem.compressorControls.unloadPointCapacity = item.compressedAirControlsProperties.unloadPointCapacity;
                compressorInventoryItem.compressorControls.numberOfUnloadSteps = item.compressedAirControlsProperties.numberOfUnloadSteps;
                compressorInventoryItem.compressorControls.automaticShutdown = item.compressedAirControlsProperties.automaticShutdown;
                compressorInventoryItem.compressorControls.unloadSumpPressure = item.compressedAirControlsProperties.unloadSumpPressure;

                compressorInventoryItem.designDetails.blowdownTime = item.compressedAirDesignDetailsProperties.blowdownTime;
                compressorInventoryItem.designDetails.modulatingPressureRange = item.compressedAirDesignDetailsProperties.modulatingPressureRange;
                compressorInventoryItem.designDetails.inputPressure = item.compressedAirDesignDetailsProperties.inputPressure;
                compressorInventoryItem.designDetails.designEfficiency = item.compressedAirDesignDetailsProperties.designEfficiency;
                compressorInventoryItem.designDetails.serviceFactor = item.compressedAirDesignDetailsProperties.serviceFactor;
                compressorInventoryItem.designDetails.noLoadPowerFM = item.compressedAirDesignDetailsProperties.noLoadPowerFM;
                compressorInventoryItem.designDetails.noLoadPowerUL = item.compressedAirDesignDetailsProperties.noLoadPowerUL;
                compressorInventoryItem.designDetails.maxFullFlowPressure = item.compressedAirDesignDetailsProperties.maxFullFlowPressure;


                compressorInventoryItem.performancePoints.fullLoad = item.compressedAirPerformancePointsProperties.fullLoad;
                compressorInventoryItem.performancePoints.maxFullFlow = item.compressedAirPerformancePointsProperties.maxFullFlow;
                compressorInventoryItem.performancePoints.midTurndown = item.compressedAirPerformancePointsProperties.midTurndown;
                compressorInventoryItem.performancePoints.turndown = item.compressedAirPerformancePointsProperties.turndown;
                compressorInventoryItem.performancePoints.unloadPoint = item.compressedAirPerformancePointsProperties.unloadPoint;
                compressorInventoryItem.performancePoints.noLoad = item.compressedAirPerformancePointsProperties.noLoad;
                compressorInventoryItem.performancePoints.blowoff = item.compressedAirPerformancePointsProperties.blowoff;




                compressorInventoryItem.centrifugalSpecifics.surgeAirflow = item.centrifugalSpecifics.surgeAirflow;
                compressorInventoryItem.centrifugalSpecifics.maxFullLoadPressure = item.centrifugalSpecifics.maxFullLoadPressure;
                compressorInventoryItem.centrifugalSpecifics.maxFullLoadCapacity = item.centrifugalSpecifics.maxFullLoadCapacity;
                compressorInventoryItem.centrifugalSpecifics.minFullLoadPressure = item.centrifugalSpecifics.minFullLoadPressure;
                compressorInventoryItem.centrifugalSpecifics.minFullLoadCapacity = item.centrifugalSpecifics.minFullLoadCapacity;


                compressedAirAssessment.compressorInventoryItems.push(compressorInventoryItem);


            });

            compressedAirAssessment.systemInformation.totalAirStorage = selectedCompressedAirSystem.totalAirStorage;

            connectedInventoryData.ownerAssessmentId = assessment.id;
            connectedInventoryData.isConnected = true;
            connectedInventoryData.canConnect = false;
            connectedInventoryData.connectedItem.assessmentId = assessment.id;

            compressedAirAssessment.connectedItem = connectedInventoryData.connectedItem;
            assessment.compressedAirAssessment.systemInformation = compressedAirAssessment.systemInformation;
            assessmentCompressedAirAssessment.systemInformation = compressedAirAssessment.systemInformation;

            compressedAirInventory.compressedAirInventoryData.systems.forEach(dept => {
                dept.catalog.map(compressedAirItem => {
                    if (compressedAirItem.id === connectedInventoryData.connectedItem.id) {
                        let connectedCompressorFromState = copyObject(selectedCompressedAirSystem);
                        let connectedAsssessment: ConnectedItem = {
                            assessmentId: assessment.id,
                            name: assessment.name,
                            inventoryId: connectedInventoryData.connectedItem.inventoryId,
                            connectedCompressorFromState: {
                                compressorMotor: connectedCompressorFromState.compressedAirMotor,
                                nameplateData: connectedCompressorFromState.nameplateData,
                                compressedAirControlsProperties: connectedCompressorFromState.compressedAirControlsProperties,
                                compressedAirDesignDetailsProperties: connectedCompressorFromState.compressedAirDesignDetailsProperties,
                                compressedAirPerformancePointsProperties: connectedCompressorFromState.compressedAirPerformancePointsProperties,
                                centrifugalSpecifics: connectedCompressorFromState.centrifugalSpecifics,
                                fieldMeasurements: connectedCompressorFromState.fieldMeasurements,
                            }
                        }
                        if (compressedAirItem.connectedAssessments) {
                            compressedAirItem.connectedAssessments.push(connectedAsssessment);
                        } else {
                            compressedAirItem.connectedAssessments = [connectedAsssessment];
                        }
                    }
                })
            });

            await firstValueFrom(this.inventoryDbService.updateWithObservable(compressedAirInventory));
            let updatedInventoryItems: InventoryItem[] = await firstValueFrom(this.inventoryDbService.getAllInventory());
            this.inventoryDbService.setAll(updatedInventoryItems);
            this.integrationStateService.connectedInventoryData.next(connectedInventoryData);
        }
    }


    // * take separate assessment, compressedAirAssessment args so _compressedAirAssessment can be saved to assessment in compressedAirAssessment.component
    async setCompressedAirAssessmentFromExistingMotorItem(connectedInventoryData: ConnectedInventoryData, assessmentCompressedAirAssessment: CompressedAirAssessment, assessment: Assessment) {
        let connectedAssessmentState: IntegrationState = {
            connectedAssessmentStatus: undefined,
            msgHTML: undefined
        }

        let motorInventory: InventoryItem = this.inventoryDbService.getById(connectedInventoryData.connectedItem.inventoryId);
        let motorInventorySettings: Settings = this.settingsDbService.getByInventoryId(motorInventory);
        let selectedMotoritem: MotorItem = this.getConnectedMotorItem(connectedInventoryData.connectedItem);
        let compressedAirAssessment: CompressedAirAssessment = assessmentCompressedAirAssessment;

        if (selectedMotoritem.validMotor && !selectedMotoritem.validMotor.isValid) {
            connectedAssessmentState.connectedAssessmentStatus = 'invalid';
            connectedAssessmentState.msgHTML = `<b>${selectedMotoritem.name}</b> is invalid. Verify compressedAir catalog data and try again.`;
            connectedInventoryData.canConnect = false;
            this.integrationStateService.connectedAssessmentState.next(connectedAssessmentState);
        } else {
            let assessmentSettings: Settings = this.settingsDbService.getByAssessmentId(assessment, true);
            if (motorInventorySettings.unitsOfMeasure !== assessmentSettings.unitsOfMeasure) {
                if (connectedInventoryData.shouldConvertItemUnits) {
                    connectedInventoryData.shouldConvertItemUnits = false;
                    selectedMotoritem = copyObject(selectedMotoritem);
                    selectedMotoritem.nameplateData = this.convertMotorInventoryService.convertNameplateData(selectedMotoritem.nameplateData, motorInventorySettings, assessmentSettings);
                    connectedInventoryData.canConnect = true;
                } else {
                    connectedAssessmentState.connectedAssessmentStatus = 'settings-differ';
                    connectedAssessmentState.msgHTML = `Selected units of measure for inventory <b>${motorInventory.name}</b> differ from this assessment`;
                    connectedInventoryData.canConnect = false;
                }
                this.integrationStateService.connectedAssessmentState.next(connectedAssessmentState);
            }
        }

        if (connectedInventoryData.canConnect) {
            //TODO: Waiting on Alex if motor inventory is to be connected to CA Assessment, if so will be seperate issue 
            //compressedAirAssessment.inputs = this.setCompressedAirAssessmentInputsFromMotor(compressedAirAssessment.inputs, selectedMotoritem);
            connectedInventoryData.ownerAssessmentId = assessment.id;
            connectedInventoryData.isConnected = true;
            connectedInventoryData.canConnect = false;
            connectedInventoryData.connectedItem.assessmentId = assessment.id;

            compressedAirAssessment.connectedItem = connectedInventoryData.connectedItem;
            assessment.compressedAirAssessment.compressorInventoryItems = compressedAirAssessment.compressorInventoryItems;
            assessmentCompressedAirAssessment.compressorInventoryItems = compressedAirAssessment.compressorInventoryItems;
            assessmentCompressedAirAssessment = compressedAirAssessment;

            motorInventory.motorInventoryData.departments.forEach(dept => {
                dept.catalog.map(motorItem => {
                    if (motorItem.id === connectedInventoryData.connectedItem.id) {
                        let connectedItem: ConnectedItem = {
                            assessmentId: assessment.id,
                            name: selectedMotoritem.name,
                            inventoryId: connectedInventoryData.ownerInventoryId,
                            departmentId: selectedMotoritem.departmentId,
                            assessmentName: assessment.name,
                            assessmentType: 'CompressedAir',
                            inventoryType: 'motor'
                        }
                        if (motorItem.connectedItems) {
                            motorItem.connectedItems.push(connectedItem);
                        } else {
                            motorItem.connectedItems = [connectedItem];
                        }
                    }
                })
            });

            await firstValueFrom(this.inventoryDbService.updateWithObservable(motorInventory));
            let allInventoryItems: InventoryItem[] = await firstValueFrom(this.inventoryDbService.getAllInventory());
            this.inventoryDbService.setAll(allInventoryItems);

            this.integrationStateService.connectedInventoryData.next(connectedInventoryData);
        }
    }


    async setFromConnectedMotorItem(compressedAirAssessment: CompressedAirAssessment, assessment: Assessment, settings: Settings) {
        let motorItem = this.compressedAirMotorIntegrationService.getConnectedMotorItem(compressedAirAssessment.connectedItem, settings);
        let connectedInventoryData: ConnectedInventoryData = this.integrationStateService.getEmptyConnectedInventoryData();
        connectedInventoryData.connectedItem = compressedAirAssessment.connectedItem;
        connectedInventoryData.ownerItemId = String(compressedAirAssessment.connectedItem.assessmentId);
        connectedInventoryData.ownerInventoryId = undefined;
        connectedInventoryData.isConnected = true;

        if (motorItem) {
            //TODO: Waiting on Alex if motor inventory is to be connected to CA Assessment, if so will be seperate issue 
            //compressedAirAssessment.inputs = this.setCompressedAirAssessmentInputsFromMotor(compressedAirAssessment.inputs, motorItem);
            this.integrationStateService.connectedInventoryData.next(connectedInventoryData);
        } else {
            // item or inventory was deleted
            delete compressedAirAssessment.connectedItem;
            this.integrationStateService.connectedAssessmentState.next(this.integrationStateService.getEmptyIntegrationState());
            await firstValueFrom(this.assessmentDbService.updateWithObservable(assessment));
            let allAssessments: Assessment[] = await firstValueFrom(this.assessmentDbService.getAllAssessments());
            await this.assessmentDbService.setAll(allAssessments);
        }
    }

    //TODO: Waiting on Alex if motor inventory is to be connected to CA Assessment, if so will be seperate issue 
    setCompressedAirAssessmentInputsFromMotor(inputs: CompressorInventoryItem, motorItem: MotorItem) {
        // inputs.line_frequency = motorItem.nameplateData.lineFrequency;
        // inputs.motor_rated_power = motorItem.nameplateData.ratedMotorPower;
        // inputs.efficiency_class = motorItem.nameplateData.efficiencyClass;
        // inputs.motor_rated_voltage = motorItem.nameplateData.ratedVoltage;
        // inputs.motor_rated_fla = motorItem.nameplateData.fullLoadAmps;
        // inputs.motor_rated_speed = motorItem.nameplateData.fullLoadSpeed;
        // inputs.efficiency = motorItem.nameplateData.nominalEfficiency;
        return inputs;
    }


    setCompressedAirAssessmentConnectedInventoryData(assessment: Assessment, settings: Settings) {
        let connectedInventoryData: ConnectedInventoryData = this.integrationStateService.getEmptyConnectedInventoryData();
        if (assessment.compressedAirAssessment.connectedItem) {
            let connectedItem: CompressedAirInventorySystem | MotorItem;
            if (assessment.compressedAirAssessment.connectedItem.inventoryType === 'compressed-air') {
                connectedItem = this.getConnectedCompressedAirItem(assessment.compressedAirAssessment.connectedItem);
            } else if (assessment.compressedAirAssessment.connectedItem.inventoryType === 'motor') {
                connectedItem = this.compressedAirMotorIntegrationService.getConnectedMotorItem(assessment.compressedAirAssessment.connectedItem, settings);
            }
            if (connectedItem) {
                connectedInventoryData.connectedItem = assessment.compressedAirAssessment.connectedItem;
                connectedInventoryData.isConnected = true;
                this.integrationStateService.connectedInventoryData.next(connectedInventoryData);
            } else {
                // item was deleted
                delete assessment.compressedAirAssessment.connectedItem;
                this.integrationStateService.connectedAssessmentState.next(this.integrationStateService.getEmptyIntegrationState());
            }
        }
    }

    getHasConnectedCompressedAirAssessment(inventoryItem: InventoryItem) {
        return inventoryItem.compressedAirInventoryData.systems.some(system => {
            return system.catalog.some(item => item.connectedAssessments && item.connectedAssessments.length != 0);
        });
    }

    async removeConnectedCompressedAirInventory(connectedItem: ConnectedItem, ownerAssessmentId: number) {
        let compressedAirInventory: InventoryItem = this.inventoryDbService.getById(connectedItem.inventoryId);
        compressedAirInventory.compressedAirInventoryData.systems.forEach(dept => {
            dept.catalog.map(compressedAirItem => {
                if (compressedAirItem.id === connectedItem.id && compressedAirItem.connectedAssessments) {
                    let connectedCompressedAirIndex = compressedAirItem.connectedAssessments.findIndex(item => item.assessmentId === ownerAssessmentId);
                    compressedAirItem.connectedAssessments.splice(connectedCompressedAirIndex, 1);
                    if (compressedAirItem.connectedAssessments.length === 0) {
                        compressedAirItem.connectedAssessments = undefined;
                    }
                }
            });
        });

        await firstValueFrom(this.inventoryDbService.updateWithObservable(compressedAirInventory));
        let updatedInventoryItems: InventoryItem[] = await firstValueFrom(this.inventoryDbService.getAllInventory());
        this.inventoryDbService.setAll(updatedInventoryItems);
        this.integrationStateService.connectedInventoryData.next(this.integrationStateService.getEmptyConnectedInventoryData());
        this.integrationStateService.connectedAssessmentState.next(this.integrationStateService.getEmptyIntegrationState());
    }

    async removeMotorConnectedItem(connectedItem: ConnectedItem) {
        let motorInventoryItem: InventoryItem = this.inventoryDbService.getById(connectedItem.inventoryId);
        if (motorInventoryItem) {
            motorInventoryItem.motorInventoryData.departments.find(department => {
                if (department.id === connectedItem.departmentId) {
                    department.catalog.map(motorItem => {
                        if (motorItem.connectedItems && motorItem.id === connectedItem.id) {
                            // connected items undefined
                            let connectedCompressedAirIndex = motorItem.connectedItems.findIndex(item => item.assessmentId === connectedItem.assessmentId);
                            motorItem.connectedItems.splice(connectedCompressedAirIndex, 1);
                            if (motorItem.connectedItems.length === 0) {
                                motorItem.connectedItems = undefined;
                            }
                        }
                    });
                }
            });
            await firstValueFrom(this.inventoryDbService.updateWithObservable(motorInventoryItem));
            let allInventoryItems: InventoryItem[] = await firstValueFrom(this.inventoryDbService.getAllInventory());
            this.inventoryDbService.setAll(allInventoryItems);

            this.integrationStateService.connectedInventoryData.next(this.integrationStateService.getEmptyConnectedInventoryData());
            this.integrationStateService.connectedAssessmentState.next(this.integrationStateService.getEmptyIntegrationState());
        }
    }


    checkConnectedAssessmentDiffers(selectedCompressedAir: CompressedAirItem) {
        let differingConnectedValues: Array<ConnectedValueFormField> = [];
        let differingAssessments: Array<ConnectedItem> = selectedCompressedAir.connectedAssessments.filter((connectedAssessment: ConnectedItem) => {
            let assessment = this.assessmentDbService.findById(connectedAssessment.assessmentId);
            let assessmentSettings = this.settingsDbService.getByAssessmentId(assessment, true);
            let compressedAirInventory: InventoryItem = this.inventoryDbService.getById(connectedAssessment.inventoryId);
            let compressedAirInventorySettings: Settings = this.settingsDbService.getByInventoryId(compressedAirInventory);
            let settingsDiffer: boolean = assessmentSettings.unitsOfMeasure !== compressedAirInventorySettings.unitsOfMeasure;
            let isMotorMatch: boolean = true;
            isMotorMatch = Object.keys(selectedCompressedAir.compressedAirMotor).every((key, index) => {
                let newValue = selectedCompressedAir.compressedAirMotor[key];
                let connectedFromValue = connectedAssessment.connectedCompressorFromState.compressorMotor[key];
                if (settingsDiffer && key === 'motorRatedPower') {
                    let assessmentUnit: string = assessmentSettings.unitsOfMeasure === 'Imperial' ? 'hp' : 'kW';
                    let inventoryUnit: string = compressedAirInventorySettings.unitsOfMeasure === 'Imperial' ? 'hp' : 'kW';
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

            let isNameplateDataMatch: boolean = true;
            let isControlsMatch: boolean = true;
            let isDesignDetailsMatch: boolean = true;
            let isPerformancePointsMatch: boolean = true;
            let isCentrifugalSpecificsMatch: boolean = true;

            isNameplateDataMatch = Object.keys(selectedCompressedAir.nameplateData).every((key, index) => {
                let newValue = selectedCompressedAir.nameplateData[key];
                let connectedFromValue = connectedAssessment.connectedCompressorFromState.nameplateData[key];
                let valuesEqual: boolean = newValue === connectedFromValue;
                if (!valuesEqual) {
                    let nameplateField: ConnectedValueFormField = {
                        formGroup: 'compressed-air',
                    }
                    differingConnectedValues.push(nameplateField);
                }
            });
            isControlsMatch = Object.keys(selectedCompressedAir.compressedAirControlsProperties).every((key, index) => {
                let newValue = selectedCompressedAir.compressedAirControlsProperties[key];
                let connectedFromValue = connectedAssessment.connectedCompressorFromState.compressedAirControlsProperties[key];
                let valuesEqual: boolean = newValue === connectedFromValue;
                if (!valuesEqual) {
                    let controlsField: ConnectedValueFormField = {
                        formGroup: 'compressed-air',
                    }
                    differingConnectedValues.push(controlsField);
                }
            });
            isDesignDetailsMatch = Object.keys(selectedCompressedAir.compressedAirDesignDetailsProperties).every((key, index) => {
                let newValue = selectedCompressedAir.compressedAirDesignDetailsProperties[key];
                let connectedFromValue = connectedAssessment.connectedCompressorFromState.compressedAirDesignDetailsProperties[key];
                let valuesEqual: boolean = newValue === connectedFromValue;
                if (!valuesEqual) {
                    let controlsField: ConnectedValueFormField = {
                        formGroup: 'compressed-air',
                    }
                    differingConnectedValues.push(controlsField);
                }
            });
            isPerformancePointsMatch = Object.keys(selectedCompressedAir.compressedAirPerformancePointsProperties).every((key, index) => {
                let newValue = selectedCompressedAir.compressedAirPerformancePointsProperties[key];
                let connectedFromValue = connectedAssessment.connectedCompressorFromState.compressedAirPerformancePointsProperties[key];
                let valuesEqual: boolean = newValue === connectedFromValue;
                if (!valuesEqual) {
                    let controlsField: ConnectedValueFormField = {
                        formGroup: 'compressed-air',
                    }
                    differingConnectedValues.push(controlsField);
                }
            });
            isCentrifugalSpecificsMatch = Object.keys(selectedCompressedAir.centrifugalSpecifics).every((key, index) => {
                let newValue = selectedCompressedAir.centrifugalSpecifics[key];
                let connectedFromValue = connectedAssessment.connectedCompressorFromState.centrifugalSpecifics[key];
                let valuesEqual: boolean = newValue === connectedFromValue;
                if (!valuesEqual) {
                    let controlsField: ConnectedValueFormField = {
                        formGroup: 'compressed-air',
                    }
                    differingConnectedValues.push(controlsField);
                }
            });
            return !(isMotorMatch && isNameplateDataMatch && isControlsMatch && isDesignDetailsMatch && isPerformancePointsMatch && isCentrifugalSpecificsMatch);
        });

        this.setConnectionDiffers(differingAssessments.length !== 0, differingConnectedValues);
    }

    checkConnectedInventoryDiffers(assessment: Assessment) {
        let differingConnectedValues: Array<ConnectedValueFormField> = [];
        let connectedCompressedAirItem: CompressedAirInventorySystem = this.getConnectedCompressedAirItem(assessment.compressedAirAssessment.connectedItem);
        if (connectedCompressedAirItem && connectedCompressedAirItem.connectedAssessments) {
            let currentAssessment = connectedCompressedAirItem.connectedAssessments.find((connectedAssessment: ConnectedItem) => {
                return connectedAssessment.assessmentId === assessment.id;
            });

            if (currentAssessment) {
                assessment.compressedAirAssessment.compressorInventoryItems.forEach(item => {
                    let compressedAirAssessmentMotor: CompressedAirMotorProperties = {
                        motorPower: item.nameplateData.motorPower,
                        motorFullLoadAmps: item.nameplateData.fullLoadAmps,
                    }

                    Object.keys(compressedAirAssessmentMotor).every((key, index) => {
                        const newValue = compressedAirAssessmentMotor[key];
                        const connectedFromValue = currentAssessment.connectedCompressorFromState.compressorMotor[key];
                        let valuesEqual: boolean = newValue === connectedFromValue;
                        if (!valuesEqual) {
                            let motorField: ConnectedValueFormField = {
                                formGroup: 'motor',
                            }
                            differingConnectedValues.push(motorField);
                        }
                        return valuesEqual;
                    });

                    if (item.nameplateData.compressorType !== currentAssessment.connectedCompressorFromState.nameplateData.compressorType) {
                        let nameplateDataFormField: ConnectedValueFormField = {
                            formGroup: 'compressed-air',
                        }
                        differingConnectedValues.push(nameplateDataFormField);
                    }

                    if (item.compressorControls.controlType !== currentAssessment.connectedCompressorFromState.compressedAirControlsProperties.controlType) {
                        let controlTypeFormField: ConnectedValueFormField = {
                            formGroup: 'compressed-air',
                        }
                        differingConnectedValues.push(controlTypeFormField);
                    }
                });

            }
        }
        this.setConnectionDiffers(differingConnectedValues.length !== 0, differingConnectedValues);
    }

    setConnectionDiffers(connectionDiffers: boolean, differingConnectedValues: Array<ConnectedValueFormField>) {
        let integrationState: IntegrationState = this.integrationStateService.connectedAssessmentState.getValue();
        if (connectionDiffers) {
            integrationState.connectedAssessmentStatus = 'connected-assessment-differs'
            integrationState.differingConnectedValues = differingConnectedValues
            integrationState.msgHTML = undefined
        } else {
            integrationState.connectedAssessmentStatus = undefined
            integrationState.differingConnectedValues = differingConnectedValues
            integrationState.msgHTML = undefined
        }
        this.integrationStateService.connectedAssessmentState.next(integrationState);
    }

    getConnectedCompressedAirItem(connectedItem: ConnectedItem) {
        let system: CompressedAirInventorySystem;
        let inventoryItem: InventoryItem = this.inventoryDbService.getById(connectedItem.inventoryId);
        if (inventoryItem) {
            system = inventoryItem.compressedAirInventoryData.systems.find(system => system.id === connectedItem.departmentId);
        }
        return system;
    }

    getConnectedMotorItem(connectedItem: ConnectedItem) {
        let motorItem: MotorItem;
        let inventoryItem: InventoryItem = this.inventoryDbService.getById(connectedItem.inventoryId);
        if (inventoryItem) {
            let department: MotorInventoryDepartment = inventoryItem.motorInventoryData.departments.find(department => department.id === connectedItem.departmentId);
            if (department) {
                motorItem = department.catalog.find(motorItem => motorItem.id === connectedItem.id);
            }
        }
        return motorItem;
    }

    restoreConnectedAssessmentValues(connectedInventoryData: ConnectedInventoryData, compressedAirAssessment: CompressedAirAssessment): CompressedAirAssessment {
        // * we don't care which connected assessment
        let connectedCompressedAirItem: CompressedAirInventorySystem = this.getConnectedCompressedAirItem(compressedAirAssessment.connectedItem);
        let currentAssessment = connectedCompressedAirItem.connectedAssessments.find((connectedAssessment: ConnectedItem) => {
            return connectedAssessment.assessmentId === compressedAirAssessment.connectedItem.assessmentId;
        });

        compressedAirAssessment.compressorInventoryItems.forEach(item => {
            item.nameplateData.motorPower = currentAssessment.connectedCompressorFromState.compressorMotor.motorPower;
            item.nameplateData.fullLoadAmps = currentAssessment.connectedCompressorFromState.compressorMotor.motorFullLoadAmps;
            item.nameplateData.compressorType = currentAssessment.connectedCompressorFromState.nameplateData.compressorType;
            item.compressorControls.controlType = currentAssessment.connectedCompressorFromState.compressedAirControlsProperties.controlType;
            item.compressorControls.unloadPointCapacity = currentAssessment.connectedCompressorFromState.compressedAirControlsProperties.unloadPointCapacity;
            item.compressorControls.numberOfUnloadSteps = currentAssessment.connectedCompressorFromState.compressedAirControlsProperties.numberOfUnloadSteps;
            item.compressorControls.automaticShutdown = currentAssessment.connectedCompressorFromState.compressedAirControlsProperties.automaticShutdown;
            item.compressorControls.unloadSumpPressure = currentAssessment.connectedCompressorFromState.compressedAirControlsProperties.unloadSumpPressure;
            item.designDetails.blowdownTime = currentAssessment.connectedCompressorFromState.compressedAirDesignDetailsProperties.blowdownTime;
            item.designDetails.modulatingPressureRange = currentAssessment.connectedCompressorFromState.compressedAirDesignDetailsProperties.modulatingPressureRange;
            item.designDetails.inputPressure = currentAssessment.connectedCompressorFromState.compressedAirDesignDetailsProperties.inputPressure;
            item.designDetails.designEfficiency = currentAssessment.connectedCompressorFromState.compressedAirDesignDetailsProperties.designEfficiency;
            item.designDetails.serviceFactor = currentAssessment.connectedCompressorFromState.compressedAirDesignDetailsProperties.serviceFactor;
            item.designDetails.noLoadPowerFM = currentAssessment.connectedCompressorFromState.compressedAirDesignDetailsProperties.noLoadPowerFM;
            item.designDetails.noLoadPowerUL = currentAssessment.connectedCompressorFromState.compressedAirDesignDetailsProperties.noLoadPowerUL;
            item.designDetails.maxFullFlowPressure = currentAssessment.connectedCompressorFromState.compressedAirDesignDetailsProperties.maxFullFlowPressure;
            item.performancePoints.fullLoad = currentAssessment.connectedCompressorFromState.compressedAirPerformancePointsProperties.fullLoad;
            item.performancePoints.maxFullFlow = currentAssessment.connectedCompressorFromState.compressedAirPerformancePointsProperties.maxFullFlow;
            item.performancePoints.midTurndown = currentAssessment.connectedCompressorFromState.compressedAirPerformancePointsProperties.midTurndown;
            item.performancePoints.turndown = currentAssessment.connectedCompressorFromState.compressedAirPerformancePointsProperties.turndown;
            item.performancePoints.unloadPoint = currentAssessment.connectedCompressorFromState.compressedAirPerformancePointsProperties.unloadPoint;
            item.performancePoints.noLoad = currentAssessment.connectedCompressorFromState.compressedAirPerformancePointsProperties.noLoad;
            item.performancePoints.blowoff = currentAssessment.connectedCompressorFromState.compressedAirPerformancePointsProperties.blowoff;
            item.centrifugalSpecifics.surgeAirflow = currentAssessment.connectedCompressorFromState.centrifugalSpecifics.surgeAirflow;
            item.centrifugalSpecifics.maxFullLoadPressure = currentAssessment.connectedCompressorFromState.centrifugalSpecifics.maxFullLoadPressure;
            item.centrifugalSpecifics.maxFullLoadCapacity = currentAssessment.connectedCompressorFromState.centrifugalSpecifics.maxFullLoadCapacity;
            item.centrifugalSpecifics.minFullLoadPressure = currentAssessment.connectedCompressorFromState.centrifugalSpecifics.minFullLoadPressure;
            item.centrifugalSpecifics.minFullLoadCapacity = currentAssessment.connectedCompressorFromState.centrifugalSpecifics.minFullLoadCapacity;
        });

        connectedInventoryData.shouldRestoreConnectedValues = false;
        this.integrationStateService.connectedInventoryData.next(connectedInventoryData);
        return compressedAirAssessment;
    }

    restoreConnectedInventoryValues(selectedCompressedAir: CompressedAirItem, connectedInventoryData: ConnectedInventoryData) {
        // * we don't care which connected assessment
        let currentAssessment = selectedCompressedAir.connectedAssessments[0];
        selectedCompressedAir.nameplateData.compressorType = currentAssessment.connectedCompressorFromState.nameplateData.compressorType;
        selectedCompressedAir.compressedAirControlsProperties.controlType = currentAssessment.connectedCompressorFromState.compressedAirControlsProperties.controlType;
        selectedCompressedAir.compressedAirDesignDetailsProperties.designEfficiency = currentAssessment.connectedCompressorFromState.compressedAirDesignDetailsProperties.designEfficiency;
        selectedCompressedAir.compressedAirMotor.motorFullLoadAmps = currentAssessment.connectedCompressorFromState.compressorMotor.motorFullLoadAmps;
        selectedCompressedAir.compressedAirMotor.motorPower = currentAssessment.connectedCompressorFromState.compressorMotor.motorPower;
        selectedCompressedAir.centrifugalSpecifics.maxFullLoadCapacity = currentAssessment.connectedCompressorFromState.centrifugalSpecifics.maxFullLoadCapacity;
        selectedCompressedAir.centrifugalSpecifics.maxFullLoadPressure = currentAssessment.connectedCompressorFromState.centrifugalSpecifics.maxFullLoadPressure;
        selectedCompressedAir.centrifugalSpecifics.minFullLoadCapacity = currentAssessment.connectedCompressorFromState.centrifugalSpecifics.minFullLoadCapacity;
        selectedCompressedAir.centrifugalSpecifics.minFullLoadPressure = currentAssessment.connectedCompressorFromState.centrifugalSpecifics.minFullLoadPressure;
        selectedCompressedAir.centrifugalSpecifics.surgeAirflow = currentAssessment.connectedCompressorFromState.centrifugalSpecifics.surgeAirflow;
        connectedInventoryData.shouldRestoreConnectedValues = false;
        this.integrationStateService.connectedInventoryData.next(connectedInventoryData)
    }

    getNewInventoryItem(): CompressorInventoryItem {
        return {
            itemId: Math.random().toString(36).substr(2, 9),
            name: 'New Compressor',
            description: undefined,
            modifiedDate: new Date(),
            nameplateData: {
                compressorType: undefined,
                motorPower: undefined,
                fullLoadOperatingPressure: undefined,
                fullLoadRatedCapacity: undefined,
                ratedLoadPower: undefined,
                ploytropicCompressorExponent: 1.4,
                fullLoadAmps: undefined,
                totalPackageInputPower: undefined
            },
            compressorControls: {
                controlType: undefined,
                unloadPointCapacity: 100,
                numberOfUnloadSteps: 2,
                automaticShutdown: false,
                unloadSumpPressure: 15
            },
            designDetails: {
                blowdownTime: 40,
                modulatingPressureRange: undefined,
                inputPressure: undefined,
                designEfficiency: undefined,
                serviceFactor: 1.15,
                noLoadPowerFM: undefined,
                noLoadPowerUL: undefined,
                maxFullFlowPressure: undefined
            },
            centrifugalSpecifics: {
                surgeAirflow: undefined,
                maxFullLoadPressure: undefined,
                maxFullLoadCapacity: undefined,
                minFullLoadPressure: undefined,
                minFullLoadCapacity: undefined
            },
            performancePoints: {
                fullLoad: {
                    dischargePressure: undefined,
                    isDefaultPower: true,
                    airflow: undefined,
                    isDefaultAirFlow: true,
                    power: undefined,
                    isDefaultPressure: true
                },
                maxFullFlow: {
                    dischargePressure: undefined,
                    isDefaultPower: true,
                    airflow: undefined,
                    isDefaultAirFlow: true,
                    power: undefined,
                    isDefaultPressure: true
                },
                midTurndown: {
                    dischargePressure: undefined,
                    isDefaultPower: true,
                    airflow: undefined,
                    isDefaultAirFlow: true,
                    power: undefined,
                    isDefaultPressure: true
                },
                turndown: {
                    dischargePressure: undefined,
                    isDefaultPower: true,
                    airflow: undefined,
                    isDefaultAirFlow: true,
                    power: undefined,
                    isDefaultPressure: true
                },
                unloadPoint: {
                    dischargePressure: undefined,
                    isDefaultPower: true,
                    airflow: undefined,
                    isDefaultAirFlow: true,
                    power: undefined,
                    isDefaultPressure: true
                },
                noLoad: {
                    dischargePressure: undefined,
                    isDefaultPower: true,
                    airflow: undefined,
                    isDefaultAirFlow: true,
                    power: undefined,
                    isDefaultPressure: true
                },
                blowoff: {
                    dischargePressure: undefined,
                    isDefaultPower: true,
                    airflow: undefined,
                    isDefaultAirFlow: true,
                    power: undefined,
                    isDefaultPressure: true
                }
            }
        }
    }

}


export interface CompressedAirAssessmentIntegrationResult {
    connectedItem: CompressedAirItem,
    compressedAirAssessmentInventoryItems?: Array<CompressorInventoryItem>,
    compressedAirAssessmentSystemInfo?: SystemInformation
}