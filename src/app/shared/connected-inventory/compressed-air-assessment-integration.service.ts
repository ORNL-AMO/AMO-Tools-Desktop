import { Injectable } from '@angular/core';
import { Assessment } from '../models/assessment';
import { AssessmentOption, ConnectedCompressor, ConnectedInventoryData, ConnectedItem, ConnectedValueFormField, IntegrationState, InventoryOption } from './integrations';
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
import { CentrifugalSpecifics, CompressedAirControlsProperties, CompressedAirDesignDetailsProperties, CompressedAirInventorySystem, CompressedAirItem, CompressedAirMotorProperties, CompressedAirPerformancePointsProperties, NameplateData, PerformancePoint } from '../../compressed-air-inventory/compressed-air-inventory';


// todo Not immediately required but we should probably address a few things at some point:
// todo Connections are modeled at the system level and logically connected at system, but value comparison is on a compressor level
// todo we needed to refactor some of this for a deadline and I am seeing some redundant properties + properties assigned at the wrong object level
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
        let selectedSystem: CompressedAirInventorySystem = this.getConnectedSystem(connectedInventoryData.connectedItem);
        // todo we may not need the additional assessment ref here. this was originally done in psat integration because psat module has issues with shared assessment refs (and other tech debt in psat top level component)
        let compressedAirAssessment: CompressedAirAssessment = assessmentCompressedAirAssessment;

        selectedSystem.isValid = this.compressedAirInventoryService.setIsValidSystem(compressedAirInventory.compressedAirInventoryData, selectedSystem);
        if (!selectedSystem.isValid) {
            connectedAssessmentState.connectedAssessmentStatus = 'invalid';
            connectedAssessmentState.msgHTML = `<b>${selectedSystem.name}</b> is invalid. Verify compressedAir catalog data and try again.`;
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
            let inventoryCompressorToConnectedCompressorMap: Record<string, string> = {};
            selectedSystem.catalog.forEach(item => {
                let compressorInventoryItem: CompressorInventoryItem = this.getNewInventoryItem();
                inventoryCompressorToConnectedCompressorMap[item.id] = compressorInventoryItem.itemId;
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

                // todo watch object reassignments here
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

            compressedAirAssessment.systemInformation.totalAirStorage = selectedSystem.totalAirStorage;

            connectedInventoryData.ownerAssessmentId = assessment.id;
            connectedInventoryData.isConnected = true;
            connectedInventoryData.canConnect = false;
            connectedInventoryData.connectedItem.assessmentId = assessment.id;

            compressedAirAssessment.connectedItem = connectedInventoryData.connectedItem;
            assessment.compressedAirAssessment.systemInformation = compressedAirAssessment.systemInformation;
            assessmentCompressedAirAssessment.systemInformation = compressedAirAssessment.systemInformation;

            let connectedAsssessment: ConnectedItem = {
                assessmentId: assessment.id,
                name: assessment.name,
                inventoryId: connectedInventoryData.connectedItem.inventoryId,
                connectedCompressorsFromState: []
            };

            compressedAirInventory.compressedAirInventoryData.systems.forEach(system => {
                if (system.id === connectedInventoryData.connectedItem.id) {
                    system.catalog.map((item: CompressedAirItem) => {
                        // * connectedFromState must be set from a new reference OR values will automatically be syncd between connected items
                        let originalCompressorItem: CompressedAirItem = { ...item };

                        // todo these actually represent connected-assessment-compressor (at original connected from state)
                        const connectedCompressorsFromState: ConnectedCompressor = {
                            originalCompressorId: originalCompressorItem.id,
                            connectedCompressorId: inventoryCompressorToConnectedCompressorMap[originalCompressorItem.id],
                            compressorMotor: { ...originalCompressorItem.compressedAirMotor },
                            nameplateData: { ...originalCompressorItem.nameplateData },
                            compressedAirControlsProperties: { ...originalCompressorItem.compressedAirControlsProperties },
                            compressedAirDesignDetailsProperties: { ...originalCompressorItem.compressedAirDesignDetailsProperties },
                            compressedAirPerformancePointsProperties: { ...originalCompressorItem.compressedAirPerformancePointsProperties },
                            centrifugalSpecifics: { ...originalCompressorItem.centrifugalSpecifics },
                            fieldMeasurements: { ...originalCompressorItem.fieldMeasurements },
                        };

                        connectedAsssessment.connectedCompressorsFromState.push(connectedCompressorsFromState);
                    });

                    if (system.connectedAssessments) {
                        system.connectedAssessments.push(connectedAsssessment);
                    } else {
                        system.connectedAssessments = [connectedAsssessment];
                    }
                }
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
                connectedItem = this.getConnectedSystem(assessment.compressedAirAssessment.connectedItem);
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
        let hasConnectedAssessment = inventoryItem.compressedAirInventoryData.systems.some(system => system.connectedAssessments && system.connectedAssessments.length != 0);
        return hasConnectedAssessment;
    }

    async removeConnectedCompressedAirInventory(connectedItem: ConnectedItem, ownerAssessmentId: number) {
        let compressedAirInventory: InventoryItem = this.inventoryDbService.getById(connectedItem.inventoryId);
        compressedAirInventory.compressedAirInventoryData.systems.forEach(system => {
            if (system.id === connectedItem.id && system.connectedAssessments) {
                let connectedCompressedAirIndex = system.connectedAssessments.findIndex(item => item.assessmentId === ownerAssessmentId);
                system.connectedAssessments.splice(connectedCompressedAirIndex, 1);
                if (system.connectedAssessments.length === 0) {
                    system.connectedAssessments = undefined;
                }
            }
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


    checkConnectedAssessmentDiffers(selectedInventoryCompressor: CompressedAirItem, selectedSystem: CompressedAirInventorySystem) {
        let differingConnectedValues: Array<ConnectedValueFormField> = [];
        let differingAssessments: Array<ConnectedItem> = selectedSystem.connectedAssessments.filter((connectedAssessment: ConnectedItem) => {
            let assessment = this.assessmentDbService.findById(connectedAssessment.assessmentId);
            let assessmentSettings = this.settingsDbService.getByAssessmentId(assessment, true);
            let compressedAirInventory: InventoryItem = this.inventoryDbService.getById(connectedAssessment.inventoryId);
            let compressedAirInventorySettings: Settings = this.settingsDbService.getByInventoryId(compressedAirInventory);
            let settingsDiffer: boolean = assessmentSettings.unitsOfMeasure !== compressedAirInventorySettings.unitsOfMeasure;

            const originalConnectedFromState = connectedAssessment.connectedCompressorsFromState.find((originalConnectedFromState: ConnectedCompressor) => {
                return originalConnectedFromState.originalCompressorId === selectedInventoryCompressor.id;
            });

            let isMotorMatch: boolean = true;
            let isNameplateDataMatch: boolean = true;
            let isControlsMatch: boolean = true;
            let isDesignDetailsMatch: boolean = true;
            let isPerformancePointsMatch: boolean = true;
            let isCentrifugalSpecificsMatch: boolean = true;

            if (originalConnectedFromState) {
                // todo Only using 'compressed-air' for formgroup names right now. 
                // todo connected-assessment-status component must be updated alongside integration service to better support invididual fields/groups

                isMotorMatch = Object.keys(selectedInventoryCompressor.compressedAirMotor).every((key, index) => {
                    let newValue = selectedInventoryCompressor.compressedAirMotor[key];
                    let connectedFromValue = originalConnectedFromState.compressorMotor[key];
                    if (settingsDiffer && key === 'motorPower') {
                        let assessmentUnit: string = assessmentSettings.unitsOfMeasure === 'Imperial' ? 'hp' : 'kW';
                        let inventoryUnit: string = compressedAirInventorySettings.unitsOfMeasure === 'Imperial' ? 'hp' : 'kW';
                        connectedFromValue = this.convertUnitsService.value(connectedFromValue).from(assessmentUnit).to(inventoryUnit);
                        connectedFromValue = this.convertUnitsService.roundVal(connectedFromValue, 2)
                    }
                    let valuesEqual: boolean = newValue === connectedFromValue;
                    if (!valuesEqual) {
                        let motorField: ConnectedValueFormField = {
                            formGroup: 'compressed-air',
                            itemId: selectedInventoryCompressor.id
                        }
                        differingConnectedValues.push(motorField);
                    }
                    return valuesEqual;
                });

                isNameplateDataMatch = Object.keys(selectedInventoryCompressor.nameplateData).every((key, index) => {
                    let newValue = selectedInventoryCompressor.nameplateData[key];
                    let connectedFromValue = originalConnectedFromState.nameplateData[key];
                    let valuesEqual: boolean = newValue === connectedFromValue;
                    if (!valuesEqual) {
                        let nameplateField: ConnectedValueFormField = {
                            formGroup: 'compressed-air',
                            itemId: selectedInventoryCompressor.id
                        }
                        differingConnectedValues.push(nameplateField);
                    }
                    return valuesEqual;
                });
                isControlsMatch = Object.keys(selectedInventoryCompressor.compressedAirControlsProperties).every((key, index) => {
                    let newValue = selectedInventoryCompressor.compressedAirControlsProperties[key];
                    let connectedFromValue = originalConnectedFromState.compressedAirControlsProperties[key];
                    let valuesEqual: boolean = newValue === connectedFromValue;
                    if (!valuesEqual) {
                        let controlsField: ConnectedValueFormField = {
                            formGroup: 'compressed-air',
                            itemId: selectedInventoryCompressor.id
                        }
                        differingConnectedValues.push(controlsField);
                    }
                    return valuesEqual;
                });
                isDesignDetailsMatch = Object.keys(selectedInventoryCompressor.compressedAirDesignDetailsProperties).every((key, index) => {
                    let newValue = selectedInventoryCompressor.compressedAirDesignDetailsProperties[key];
                    let connectedFromValue = originalConnectedFromState.compressedAirDesignDetailsProperties[key];
                    let valuesEqual: boolean = newValue === connectedFromValue;
                    if (!valuesEqual) {
                        let controlsField: ConnectedValueFormField = {
                            formGroup: 'compressed-air',
                            itemId: selectedInventoryCompressor.id
                        }
                        differingConnectedValues.push(controlsField);
                    }
                    return valuesEqual;
                });
                isPerformancePointsMatch = Object.keys(selectedInventoryCompressor.compressedAirPerformancePointsProperties).every((key, index) => {
                    const performancePoint: PerformancePoint = selectedInventoryCompressor.compressedAirPerformancePointsProperties[key];
                    return Object.keys(performancePoint).every((pointKey, pointIndex) => {
                        let newValue = performancePoint[pointKey];
                        let connectedFromValue = originalConnectedFromState.compressedAirPerformancePointsProperties[key][pointKey];
                        let valuesEqual: boolean = newValue === connectedFromValue;
                        if (!valuesEqual) {
                            let controlsField: ConnectedValueFormField = {
                                formGroup: 'compressed-air',
                                itemId: selectedInventoryCompressor.id
                            }
                            differingConnectedValues.push(controlsField);
                        }
                        return valuesEqual;
                    });
                });
                isCentrifugalSpecificsMatch = Object.keys(selectedInventoryCompressor.centrifugalSpecifics).every((key, index) => {
                    let newValue = selectedInventoryCompressor.centrifugalSpecifics[key];
                    let connectedFromValue = originalConnectedFromState.centrifugalSpecifics[key];
                    let valuesEqual: boolean = newValue === connectedFromValue;
                    if (!valuesEqual) {
                        let controlsField: ConnectedValueFormField = {
                            formGroup: 'compressed-air',
                            itemId: selectedInventoryCompressor.id
                        }
                        differingConnectedValues.push(controlsField);
                    }
                    return valuesEqual;
                });
            }
            return !(isMotorMatch && isNameplateDataMatch && isControlsMatch && isDesignDetailsMatch && isPerformancePointsMatch && isCentrifugalSpecificsMatch);
        });

        console.log('checkConnectedAssessmentDiffers - differingConnectedValues', differingConnectedValues);
        this.setConnectionDiffers(differingAssessments.length !== 0, differingConnectedValues);
    }

    checkConnectedInventoryDiffers(assessment: Assessment) {
        let differingConnectedValues: Array<ConnectedValueFormField> = [];
        let connectedSystem: CompressedAirInventorySystem = this.getConnectedSystem(assessment.compressedAirAssessment.connectedItem);
        if (connectedSystem && connectedSystem.connectedAssessments) {
            let connectedAssessment: ConnectedItem = connectedSystem.connectedAssessments.find((connectedAssessment: ConnectedItem) => {
                return connectedAssessment.assessmentId === assessment.id;
            });

            if (connectedAssessment) {
                assessment.compressedAirAssessment.compressorInventoryItems.forEach(item => {
                    const originalConnectedFromState = connectedAssessment.connectedCompressorsFromState.find((originalConnectedFromState: ConnectedCompressor) => {
                        return originalConnectedFromState.connectedCompressorId === item.itemId;
                    });

                    // todo Only using 'compressed-air' for formgroup names right now. 
                    // todo connected-assessment-status component must be updated alongside integration service to better support invididual fields/groups

                    // todo find out why check connected inventory methods aren't returning to a diff array like check assessments is

                    if (originalConnectedFromState) {
                        // * we're comparing inside of an inventory context. We need to build the comparison objects from inventory interfaces (IF they differ - they do here)
                        let compressedAirAssessmentMotor: CompressedAirMotorProperties = {
                            motorPower: item.nameplateData.motorPower,
                            motorFullLoadAmps: item.nameplateData.fullLoadAmps,
                        }
                        Object.keys(compressedAirAssessmentMotor).every((key, index) => {
                            const newValue = compressedAirAssessmentMotor[key];
                            const connectedFromValue = originalConnectedFromState.compressorMotor[key];
                            let valuesEqual: boolean = newValue === connectedFromValue;
                            if (!valuesEqual) {
                                let motorField: ConnectedValueFormField = {
                                    formGroup: 'compressed-air',
                                    itemId: item.itemId
                                }
                                differingConnectedValues.push(motorField);
                            }
                            return valuesEqual;
                        });


                        let centrifugal: CentrifugalSpecifics = {
                            surgeAirflow: item.centrifugalSpecifics.surgeAirflow,
                            maxFullLoadPressure: item.centrifugalSpecifics.maxFullLoadPressure,
                            maxFullLoadCapacity: item.centrifugalSpecifics.maxFullLoadCapacity,
                            minFullLoadPressure: item.centrifugalSpecifics.minFullLoadPressure,
                            minFullLoadCapacity: item.centrifugalSpecifics.minFullLoadCapacity
                        }
                        Object.keys(centrifugal).every((key, index) => {
                            const newValue = centrifugal[key];
                            const connectedFromValue = originalConnectedFromState.centrifugalSpecifics[key];
                            let valuesEqual: boolean = newValue === connectedFromValue;
                            if (!valuesEqual) {
                                let motorField: ConnectedValueFormField = {
                                    formGroup: 'compressed-air',
                                    itemId: item.itemId
                                }
                                differingConnectedValues.push(motorField);
                            }
                            return valuesEqual;
                        });



                        let nameplateData: NameplateData = {
                            compressorType: item.nameplateData.compressorType,
                            fullLoadOperatingPressure: item.nameplateData.fullLoadOperatingPressure,
                            fullLoadRatedCapacity: item.nameplateData.fullLoadRatedCapacity,
                            totalPackageInputPower: item.nameplateData.totalPackageInputPower
                        }
                        Object.keys(nameplateData).every((key, index) => {
                            const newValue = nameplateData[key];
                            const connectedFromValue = originalConnectedFromState.nameplateData[key];
                            let valuesEqual: boolean = newValue === connectedFromValue;
                            if (!valuesEqual) {
                                let motorField: ConnectedValueFormField = {
                                    formGroup: 'compressed-air',
                                    itemId: item.itemId
                                }
                                differingConnectedValues.push(motorField);
                            }
                            return valuesEqual;
                        });



                        let controls: CompressedAirControlsProperties = {
                            controlType: item.compressorControls.controlType,
                            unloadPointCapacity: item.compressorControls.unloadPointCapacity,
                            numberOfUnloadSteps: item.compressorControls.numberOfUnloadSteps,
                            automaticShutdown: item.compressorControls.automaticShutdown,
                            unloadSumpPressure: item.compressorControls.unloadSumpPressure,
                        }
                        Object.keys(controls).every((key, index) => {
                            const newValue = controls[key];
                            const connectedFromValue = originalConnectedFromState.compressedAirControlsProperties[key];
                            let valuesEqual: boolean = newValue === connectedFromValue;
                            if (!valuesEqual) {
                                let motorField: ConnectedValueFormField = {
                                    formGroup: 'compressed-air',
                                    itemId: item.itemId
                                }
                                differingConnectedValues.push(motorField);
                            }
                            return valuesEqual;
                        });


                        let designDetails: Omit<CompressedAirDesignDetailsProperties, 'estimatedTimeLoaded' | 'averageLoadFactor' | 'motorEfficiencyAtLoad'> = {
                            blowdownTime: item.designDetails.blowdownTime,
                            modulatingPressureRange: item.designDetails.modulatingPressureRange,
                            inputPressure: item.designDetails.inputPressure,
                            designEfficiency: item.designDetails.designEfficiency,
                            serviceFactor: item.designDetails.serviceFactor,
                            noLoadPowerFM: item.designDetails.noLoadPowerFM,
                            noLoadPowerUL: item.designDetails.noLoadPowerUL,
                            maxFullFlowPressure: item.designDetails.maxFullFlowPressure,
                        }
                        Object.keys(designDetails).every((key, index) => {
                            const newValue = designDetails[key];
                            const connectedFromValue = originalConnectedFromState.compressedAirDesignDetailsProperties[key];
                            let valuesEqual: boolean = newValue === connectedFromValue;
                            if (!valuesEqual) {
                                let motorField: ConnectedValueFormField = {
                                    formGroup: 'compressed-air',
                                    itemId: item.itemId
                                }
                                differingConnectedValues.push(motorField);
                            }
                            return valuesEqual;
                        });


                        let performancePoints: CompressedAirPerformancePointsProperties = {
                            fullLoad: { ...item.performancePoints.fullLoad },
                            maxFullFlow: { ...item.performancePoints.maxFullFlow },
                            midTurndown: { ...item.performancePoints.midTurndown },
                            turndown: { ...item.performancePoints.turndown },
                            unloadPoint: { ...item.performancePoints.unloadPoint },
                            noLoad: { ...item.performancePoints.noLoad },
                            blowoff: { ...item.performancePoints.blowoff }
                        }

                        Object.keys(performancePoints).every((key, index) => {
                            const performancePoint: PerformancePoint = performancePoints[key];
                            return Object.keys(performancePoint).every((pointKey, pointIndex) => {
                                let newValue = performancePoint[pointKey];
                                let connectedFromValue = originalConnectedFromState.compressedAirPerformancePointsProperties[key][pointKey];
                                let valuesEqual: boolean = newValue === connectedFromValue;
                                if (!valuesEqual) {
                                    let controlsField: ConnectedValueFormField = {
                                        formGroup: 'compressed-air',
                                        itemId: item.itemId
                                    }
                                    differingConnectedValues.push(controlsField);
                                }
                                return valuesEqual;
                            });
                        });
                    } 
                });

            }
        }

        console.log('checkConnectedInventoryDiffers - differingConnectedValues', differingConnectedValues);
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

    getConnectedSystem(connectedItem: ConnectedItem) {
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


    /**
   * Restore only the assessment compressor values for the most recently modified (selected compressor)
   * @param selectedCompressor The assessment selectedCompressor
   */
    restoreConnectedAssessmentValues(selectedCompressor: CompressorInventoryItem, connectedInventoryData: ConnectedInventoryData, compressedAirAssessment: CompressedAirAssessment): CompressedAirAssessment {
        let connectedSystem: CompressedAirInventorySystem = this.getConnectedSystem(compressedAirAssessment.connectedItem);
        let currentAssessment = connectedSystem.connectedAssessments.find((connectedAssessment: ConnectedItem) => {
            return connectedAssessment.assessmentId === compressedAirAssessment.connectedItem.assessmentId;
        });

        const originalConnectedFromState = currentAssessment.connectedCompressorsFromState.find((originalConnectedFromState: ConnectedCompressor) => {
            return originalConnectedFromState.connectedCompressorId === selectedCompressor.itemId;
        });

        selectedCompressor.nameplateData.compressorType = originalConnectedFromState.nameplateData.compressorType;
        selectedCompressor.nameplateData.fullLoadOperatingPressure = originalConnectedFromState.nameplateData.fullLoadOperatingPressure;
        selectedCompressor.nameplateData.fullLoadRatedCapacity = originalConnectedFromState.nameplateData.fullLoadRatedCapacity;
        selectedCompressor.nameplateData.totalPackageInputPower = originalConnectedFromState.nameplateData.totalPackageInputPower;

        selectedCompressor.nameplateData.motorPower = originalConnectedFromState.compressorMotor.motorPower;
        selectedCompressor.nameplateData.fullLoadAmps = originalConnectedFromState.compressorMotor.motorFullLoadAmps;

        selectedCompressor.compressorControls.controlType = originalConnectedFromState.compressedAirControlsProperties.controlType;
        selectedCompressor.compressorControls.unloadPointCapacity = originalConnectedFromState.compressedAirControlsProperties.unloadPointCapacity;
        selectedCompressor.compressorControls.numberOfUnloadSteps = originalConnectedFromState.compressedAirControlsProperties.numberOfUnloadSteps;
        selectedCompressor.compressorControls.automaticShutdown = originalConnectedFromState.compressedAirControlsProperties.automaticShutdown;
        selectedCompressor.compressorControls.unloadSumpPressure = originalConnectedFromState.compressedAirControlsProperties.unloadSumpPressure;

        selectedCompressor.designDetails.blowdownTime = originalConnectedFromState.compressedAirDesignDetailsProperties.blowdownTime;
        selectedCompressor.designDetails.modulatingPressureRange = originalConnectedFromState.compressedAirDesignDetailsProperties.modulatingPressureRange;
        selectedCompressor.designDetails.inputPressure = originalConnectedFromState.compressedAirDesignDetailsProperties.inputPressure;
        selectedCompressor.designDetails.designEfficiency = originalConnectedFromState.compressedAirDesignDetailsProperties.designEfficiency;
        selectedCompressor.designDetails.serviceFactor = originalConnectedFromState.compressedAirDesignDetailsProperties.serviceFactor;
        selectedCompressor.designDetails.noLoadPowerFM = originalConnectedFromState.compressedAirDesignDetailsProperties.noLoadPowerFM;
        selectedCompressor.designDetails.noLoadPowerUL = originalConnectedFromState.compressedAirDesignDetailsProperties.noLoadPowerUL;
        selectedCompressor.designDetails.maxFullFlowPressure = originalConnectedFromState.compressedAirDesignDetailsProperties.maxFullFlowPressure;

        // todo watch object reassignments here
        selectedCompressor.performancePoints.fullLoad = originalConnectedFromState.compressedAirPerformancePointsProperties.fullLoad;
        selectedCompressor.performancePoints.maxFullFlow = originalConnectedFromState.compressedAirPerformancePointsProperties.maxFullFlow;
        selectedCompressor.performancePoints.midTurndown = originalConnectedFromState.compressedAirPerformancePointsProperties.midTurndown;
        selectedCompressor.performancePoints.turndown = originalConnectedFromState.compressedAirPerformancePointsProperties.turndown;
        selectedCompressor.performancePoints.unloadPoint = originalConnectedFromState.compressedAirPerformancePointsProperties.unloadPoint;
        selectedCompressor.performancePoints.noLoad = originalConnectedFromState.compressedAirPerformancePointsProperties.noLoad;
        selectedCompressor.performancePoints.blowoff = originalConnectedFromState.compressedAirPerformancePointsProperties.blowoff;

        selectedCompressor.centrifugalSpecifics.surgeAirflow = originalConnectedFromState.centrifugalSpecifics.surgeAirflow;
        selectedCompressor.centrifugalSpecifics.maxFullLoadPressure = originalConnectedFromState.centrifugalSpecifics.maxFullLoadPressure;
        selectedCompressor.centrifugalSpecifics.maxFullLoadCapacity = originalConnectedFromState.centrifugalSpecifics.maxFullLoadCapacity;
        selectedCompressor.centrifugalSpecifics.minFullLoadPressure = originalConnectedFromState.centrifugalSpecifics.minFullLoadPressure;
        selectedCompressor.centrifugalSpecifics.minFullLoadCapacity = originalConnectedFromState.centrifugalSpecifics.minFullLoadCapacity;

        connectedInventoryData.shouldRestoreConnectedValues = false;
        this.integrationStateService.connectedInventoryData.next(connectedInventoryData);
        return compressedAirAssessment;
    }

    /**
   * Restore only the inventory catalog compressor values for the most recently modified compressor (selected compressor)
   * @param selectedCompressor The inventory selectedCompressor
   */
    restoreConnectedInventoryValues(selectedCompressedAirItem: CompressedAirItem, selectedSystem: CompressedAirInventorySystem, connectedInventoryData: ConnectedInventoryData) {
        let currentAssessment = selectedSystem.connectedAssessments[0];

        const originalConnectedFromState = currentAssessment.connectedCompressorsFromState.find((originalConnectedFromState: ConnectedCompressor) => {
            return originalConnectedFromState.originalCompressorId === selectedCompressedAirItem.id;
        });

        selectedCompressedAirItem.nameplateData.compressorType = originalConnectedFromState.nameplateData.compressorType;
        selectedCompressedAirItem.nameplateData.fullLoadOperatingPressure = originalConnectedFromState.nameplateData.fullLoadOperatingPressure;
        selectedCompressedAirItem.nameplateData.fullLoadRatedCapacity = originalConnectedFromState.nameplateData.fullLoadRatedCapacity;
        selectedCompressedAirItem.nameplateData.totalPackageInputPower = originalConnectedFromState.nameplateData.totalPackageInputPower;

        selectedCompressedAirItem.compressedAirMotor.motorFullLoadAmps = originalConnectedFromState.compressorMotor.motorFullLoadAmps;
        selectedCompressedAirItem.compressedAirMotor.motorPower = originalConnectedFromState.compressorMotor.motorPower;

        selectedCompressedAirItem.compressedAirControlsProperties.controlType = originalConnectedFromState.compressedAirControlsProperties.controlType;
        selectedCompressedAirItem.compressedAirControlsProperties.unloadPointCapacity = originalConnectedFromState.compressedAirControlsProperties.unloadPointCapacity;
        selectedCompressedAirItem.compressedAirControlsProperties.numberOfUnloadSteps = originalConnectedFromState.compressedAirControlsProperties.numberOfUnloadSteps;
        selectedCompressedAirItem.compressedAirControlsProperties.automaticShutdown = originalConnectedFromState.compressedAirControlsProperties.automaticShutdown;
        selectedCompressedAirItem.compressedAirControlsProperties.unloadSumpPressure = originalConnectedFromState.compressedAirControlsProperties.unloadSumpPressure;

        selectedCompressedAirItem.compressedAirDesignDetailsProperties.designEfficiency = originalConnectedFromState.compressedAirDesignDetailsProperties.designEfficiency;
        selectedCompressedAirItem.compressedAirDesignDetailsProperties.blowdownTime = originalConnectedFromState.compressedAirDesignDetailsProperties.blowdownTime;
        selectedCompressedAirItem.compressedAirDesignDetailsProperties.modulatingPressureRange = originalConnectedFromState.compressedAirDesignDetailsProperties.modulatingPressureRange;
        selectedCompressedAirItem.compressedAirDesignDetailsProperties.inputPressure = originalConnectedFromState.compressedAirDesignDetailsProperties.inputPressure;
        selectedCompressedAirItem.compressedAirDesignDetailsProperties.serviceFactor = originalConnectedFromState.compressedAirDesignDetailsProperties.serviceFactor;
        selectedCompressedAirItem.compressedAirDesignDetailsProperties.noLoadPowerFM = originalConnectedFromState.compressedAirDesignDetailsProperties.noLoadPowerFM;
        selectedCompressedAirItem.compressedAirDesignDetailsProperties.noLoadPowerUL = originalConnectedFromState.compressedAirDesignDetailsProperties.noLoadPowerUL;
        selectedCompressedAirItem.compressedAirDesignDetailsProperties.maxFullFlowPressure = originalConnectedFromState.compressedAirDesignDetailsProperties.maxFullFlowPressure;

        selectedCompressedAirItem.compressedAirPerformancePointsProperties.fullLoad = originalConnectedFromState.compressedAirPerformancePointsProperties.fullLoad;
        selectedCompressedAirItem.compressedAirPerformancePointsProperties.maxFullFlow = originalConnectedFromState.compressedAirPerformancePointsProperties.maxFullFlow;
        selectedCompressedAirItem.compressedAirPerformancePointsProperties.midTurndown = originalConnectedFromState.compressedAirPerformancePointsProperties.midTurndown;
        selectedCompressedAirItem.compressedAirPerformancePointsProperties.turndown = originalConnectedFromState.compressedAirPerformancePointsProperties.turndown;
        selectedCompressedAirItem.compressedAirPerformancePointsProperties.unloadPoint = originalConnectedFromState.compressedAirPerformancePointsProperties.unloadPoint;
        selectedCompressedAirItem.compressedAirPerformancePointsProperties.noLoad = originalConnectedFromState.compressedAirPerformancePointsProperties.noLoad;
        selectedCompressedAirItem.compressedAirPerformancePointsProperties.blowoff = originalConnectedFromState.compressedAirPerformancePointsProperties.blowoff;

        selectedCompressedAirItem.centrifugalSpecifics.maxFullLoadCapacity = originalConnectedFromState.centrifugalSpecifics.maxFullLoadCapacity;
        selectedCompressedAirItem.centrifugalSpecifics.maxFullLoadPressure = originalConnectedFromState.centrifugalSpecifics.maxFullLoadPressure;
        selectedCompressedAirItem.centrifugalSpecifics.minFullLoadCapacity = originalConnectedFromState.centrifugalSpecifics.minFullLoadCapacity;
        selectedCompressedAirItem.centrifugalSpecifics.minFullLoadPressure = originalConnectedFromState.centrifugalSpecifics.minFullLoadPressure;
        selectedCompressedAirItem.centrifugalSpecifics.surgeAirflow = originalConnectedFromState.centrifugalSpecifics.surgeAirflow;

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