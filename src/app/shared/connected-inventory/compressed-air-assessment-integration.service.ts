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
            let catalogItemOptions = inventory.compressedAirInventoryData.systems.map(system => {
                let orderedCatalog = (_.orderBy(system.catalog, (item) => item.compressedAirMotor.motorPower, ['asc']));
                return {
                    department: system.name,
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
        return compressedAirInventoryOptions;
    }

    // * take separate assessment, compressedAirAssessment args so _compressedAirAssessment can be saved to assessment in compressedAirAssessment.component
    //! Nick - need to get CompressedAirInventorySystem object from integrationStateService instead of passing in CompressedAirItem
    async setCompressedAirAssessmentFromExistingCompressedAirItem(connectedInventoryData: ConnectedInventoryData, assessmentCompressedAirAssessment: CompressedAirAssessment, assessment: Assessment, newAssessmentSettings?: Settings) {
        let connectedAssessmentState: IntegrationState = {
            connectedAssessmentStatus: undefined,
            msgHTML: undefined
        }
        let compressedAirInventory: InventoryItem = this.inventoryDbService.getById(connectedInventoryData.connectedItem.inventoryId);
        let compressedAirInventorySettings: Settings = this.settingsDbService.getByInventoryId(compressedAirInventory);
        let selectedCompressedAirItem: CompressedAirItem = this.getConnectedCompressedAirItem(connectedInventoryData.connectedItem);
        let compressedAirAssessment: CompressedAirAssessment = assessmentCompressedAirAssessment;

        if (selectedCompressedAirItem.validCompressedAir && !selectedCompressedAirItem.validCompressedAir.isValid) {
            connectedAssessmentState.connectedAssessmentStatus = 'invalid';
            connectedAssessmentState.msgHTML = `<b>${selectedCompressedAirItem.name}</b> is invalid. Verify compressedAir catalog data and try again.`;
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
                        // * convert to handle all non integrated fields, let selectedCompressedAirItem assignments take care of the rest
                        //TODO
                        //compressedAirAssessment = this.compressedAirAssessmentService.convertExistingData(compressedAirAssessment, assessmentSettings, compressedAirInventorySettings);

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
            //TODO set assessment values from inventory item
            //TODO System Information
            // compressedAirAssessment.systemInformation.compressedAir_style = selectedCompressedAirItem.systemInformation.compressedAirType;
            // compressedAirAssessment.systemInformation.compressedAir_rated_speed = selectedCompressedAirItem.systemInformation.compressedAirSpeed;
            // compressedAirAssessment.systemInformation.drive = selectedCompressedAirItem.systemInformation.driveType;

            //compressedAirAssessment.inputs.stages = selectedCompressedAirItem.compressedAirEquipment.numStages;
            // // changeLineFreq - motor.comp autmatic changes to motor_rated_speed below?


            let compressorInventoryItem: CompressorInventoryItem;

            compressorInventoryItem.nameplateData.compressorType = selectedCompressedAirItem.nameplateData.compressorType;
            compressorInventoryItem.nameplateData.fullLoadOperatingPressure = selectedCompressedAirItem.nameplateData.fullLoadOperatingPressure;
            compressorInventoryItem.nameplateData.fullLoadRatedCapacity = selectedCompressedAirItem.nameplateData.fullLoadRatedCapacity;
            compressorInventoryItem.nameplateData.totalPackageInputPower = selectedCompressedAirItem.nameplateData.totalPackageInputPower;

            compressorInventoryItem.nameplateData.motorPower = selectedCompressedAirItem.compressedAirMotor.motorPower;
            compressorInventoryItem.nameplateData.fullLoadAmps = selectedCompressedAirItem.compressedAirMotor.motorFullLoadAmps;

            compressorInventoryItem.compressorControls.controlType = selectedCompressedAirItem.compressedAirControlsProperties.controlType;
            compressorInventoryItem.compressorControls.unloadPointCapacity = selectedCompressedAirItem.compressedAirControlsProperties.unloadPointCapacity;
            compressorInventoryItem.compressorControls.numberOfUnloadSteps = selectedCompressedAirItem.compressedAirControlsProperties.numberOfUnloadSteps;
            compressorInventoryItem.compressorControls.automaticShutdown = selectedCompressedAirItem.compressedAirControlsProperties.automaticShutdown;
            compressorInventoryItem.compressorControls.unloadSumpPressure = selectedCompressedAirItem.compressedAirControlsProperties.unloadSumpPressure;

            compressorInventoryItem.designDetails.blowdownTime = selectedCompressedAirItem.compressedAirDesignDetailsProperties.blowdownTime;
            compressorInventoryItem.designDetails.modulatingPressureRange = selectedCompressedAirItem.compressedAirDesignDetailsProperties.modulatingPressureRange;
            compressorInventoryItem.designDetails.inputPressure = selectedCompressedAirItem.compressedAirDesignDetailsProperties.inputPressure;
            compressorInventoryItem.designDetails.designEfficiency = selectedCompressedAirItem.compressedAirDesignDetailsProperties.designEfficiency;
            compressorInventoryItem.designDetails.serviceFactor = selectedCompressedAirItem.compressedAirDesignDetailsProperties.serviceFactor;
            compressorInventoryItem.designDetails.noLoadPowerFM = selectedCompressedAirItem.compressedAirDesignDetailsProperties.noLoadPowerFM;
            compressorInventoryItem.designDetails.noLoadPowerUL = selectedCompressedAirItem.compressedAirDesignDetailsProperties.noLoadPowerUL;
            compressorInventoryItem.designDetails.maxFullFlowPressure = selectedCompressedAirItem.compressedAirDesignDetailsProperties.maxFullFlowPressure;


            //TODO Performance Points
            // compressorInventoryItem.designDetails.blowdownTime = selectedCompressedAirItem.compressedAirPerformancePointsProperties.blowdownTime;
            // compressorInventoryItem.designDetails.modulatingPressureRange = selectedCompressedAirItem.compressedAirPerformancePointsProperties.modulatingPressureRange;
            // compressorInventoryItem.designDetails.inputPressure = selectedCompressedAirItem.compressedAirPerformancePointsProperties.inputPressure;
            // compressorInventoryItem.designDetails.designEfficiency = selectedCompressedAirItem.compressedAirPerformancePointsProperties.designEfficiency;
            // compressorInventoryItem.designDetails.serviceFactor = selectedCompressedAirItem.compressedAirPerformancePointsProperties.serviceFactor;
            // compressorInventoryItem.designDetails.noLoadPowerFM = selectedCompressedAirItem.compressedAirPerformancePointsProperties.noLoadPowerFM;
            // compressorInventoryItem.designDetails.noLoadPowerUL = selectedCompressedAirItem.compressedAirPerformancePointsProperties.noLoadPowerUL;
            // compressorInventoryItem.designDetails.maxFullFlowPressure = selectedCompressedAirItem.compressedAirPerformancePointsProperties.maxFullFlowPressure;




            compressorInventoryItem.centrifugalSpecifics.surgeAirflow = selectedCompressedAirItem.centrifugalSpecifics.surgeAirflow;
            compressorInventoryItem.centrifugalSpecifics.maxFullLoadPressure = selectedCompressedAirItem.centrifugalSpecifics.maxFullLoadPressure;
            compressorInventoryItem.centrifugalSpecifics.maxFullLoadCapacity = selectedCompressedAirItem.centrifugalSpecifics.maxFullLoadCapacity;
            compressorInventoryItem.centrifugalSpecifics.minFullLoadPressure = selectedCompressedAirItem.centrifugalSpecifics.minFullLoadPressure;
            compressorInventoryItem.centrifugalSpecifics.minFullLoadCapacity = selectedCompressedAirItem.centrifugalSpecifics.minFullLoadCapacity;


            compressedAirAssessment.compressorInventoryItems.push(compressorInventoryItem);

            compressedAirAssessment.systemInformation.totalAirStorage = 5000;

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
                        let connectedCompressorFromState = copyObject(selectedCompressedAirItem);
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
            //compressedAirAssessment.inputs = this.setCompressedAirAssessmentInputsFromMotor(compressedAirAssessment.inputs, selectedMotoritem);
            connectedInventoryData.ownerAssessmentId = assessment.id;
            connectedInventoryData.isConnected = true;
            connectedInventoryData.canConnect = false;
            connectedInventoryData.connectedItem.assessmentId = assessment.id;

            compressedAirAssessment.connectedItem = connectedInventoryData.connectedItem;
            //assessment.compressedAirAssessment.inputs = compressedAirAssessment.inputs;
            // todo both needed?
            //assessmentCompressedAirAssessment.inputs = compressedAirAssessment.inputs;
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
            let connectedItem: CompressedAirItem | MotorItem;
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
            let isMotorMatch = Object.keys(selectedCompressedAir.compressedAirMotor).every((key, index) => {
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

            let isFluidMatch: boolean = true;
            let isEquipmentMatch: boolean = true;
            let isSystemPropertiesMatch: boolean = true;
            // if (selectedCompressedAir.fluid.fluidType !== connectedAssessment.connectedCompressedAirFromState.compressedAirFluid.fluidType) {
            //     isFluidMatch = false;
            //     let fluidFormField: ConnectedValueFormField = {
            //         formGroup: 'fluid',
            //     }
            //     differingConnectedValues.push(fluidFormField);
            // }

            // if (selectedCompressedAir.compressedAirEquipment.numStages !== connectedAssessment.connectedCompressedAirFromState.compressedAirEquipment.numStages
            //     || selectedCompressedAir.compressedAirEquipment.compressedAirType !== connectedAssessment.connectedCompressedAirFromState.compressedAirEquipment.compressedAirType) {
            //     isEquipmentMatch = false;
            //     let numStagesField: ConnectedValueFormField = {
            //         formGroup: 'compressed-air',
            //     }
            //     differingConnectedValues.push(numStagesField);
            // }

            // if (selectedCompressedAir.systemProperties.driveType !== connectedAssessment.connectedCompressedAirFromState.compressedAirSystem.driveType) {
            //     isSystemPropertiesMatch = false;
            //     let driveTypeField: ConnectedValueFormField = {
            //         formGroup: 'system',
            //     }
            //     differingConnectedValues.push(driveTypeField);
            // }
            return !(isMotorMatch && isFluidMatch && isEquipmentMatch && isSystemPropertiesMatch);
        });

        this.setConnectionDiffers(differingAssessments.length !== 0, differingConnectedValues);
    }

    checkConnectedInventoryDiffers(assessment: Assessment) {
        let differingConnectedValues: Array<ConnectedValueFormField> = [];
        let connectedCompressedAirItem: CompressedAirItem = this.getConnectedCompressedAirItem(assessment.compressedAirAssessment.connectedItem);
        if (connectedCompressedAirItem && connectedCompressedAirItem.connectedAssessments) {
            let currentAssessment = connectedCompressedAirItem.connectedAssessments.find((connectedAssessment: ConnectedItem) => {
                return connectedAssessment.assessmentId === assessment.id;
            });

            if (currentAssessment) {
                // let compressedAirAssessmentMotor: CompressedAirMotorProperties = {
                //     lineFrequency: assessment.compressedAirAssessment.inputs.line_frequency,
                //     motorRatedPower: assessment.compressedAirAssessment.inputs.motor_rated_power,
                //     motorRPM: assessment.compressedAirAssessment.inputs.motor_rated_speed,
                //     motorEfficiencyClass: assessment.compressedAirAssessment.inputs.efficiency_class,
                //     motorEfficiency: assessment.compressedAirAssessment.inputs.efficiency,
                //     motorRatedVoltage: assessment.compressedAirAssessment.inputs.motor_rated_voltage,
                //     motorFullLoadAmps: assessment.compressedAirAssessment.inputs.motor_rated_fla,
                // }

                // Object.keys(compressedAirAssessmentMotor).every((key, index) => {
                //     const newValue = compressedAirAssessmentMotor[key];
                //     const connectedFromValue = currentAssessment.connectedCompressedAirFromState.compressedAirMotor[key];
                //     let valuesEqual: boolean = newValue === connectedFromValue;
                //     if (!valuesEqual) {
                //         let motorField: ConnectedValueFormField = {
                //             formGroup: 'motor',
                //         }
                //         differingConnectedValues.push(motorField);
                //     }
                //     return valuesEqual;
                // });

                // if (assessment.compressedAirAssessment.inputs.fluidType !== currentAssessment.connectedCompressedAirFromState.compressedAirFluid.fluidType
                //     || assessment.compressedAirAssessment.inputs.stages !== currentAssessment.connectedCompressedAirFromState.compressedAirEquipment.numStages) {
                //     let fluidFormField: ConnectedValueFormField = {
                //         formGroup: 'fluid',
                //     }
                //     differingConnectedValues.push(fluidFormField);
                // }

                // if (assessment.compressedAirAssessment.inputs.compressedAir_style !== currentAssessment.connectedCompressedAirFromState.compressedAirEquipment.compressedAirType ||
                //     assessment.compressedAirAssessment.inputs.drive !== currentAssessment.connectedCompressedAirFromState.compressedAirSystem.driveType) {
                //     let numStagesField: ConnectedValueFormField = {
                //         formGroup: 'compressed-air',
                //     }
                //     differingConnectedValues.push(numStagesField);
                // }
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

    //! Nick - I need to reconfigure this toreturn CompressedAirInventorySystem
    getConnectedCompressedAirItem(connectedItem: ConnectedItem) {
        let compressedAirItem: CompressedAirItem;
        let inventoryItem: InventoryItem = this.inventoryDbService.getById(connectedItem.inventoryId);
        if (inventoryItem) {
            let system: CompressedAirInventorySystem = inventoryItem.compressedAirInventoryData.systems.find(system => system.id === connectedItem.departmentId);
            if (system) {
                compressedAirItem = system.catalog.find(compressedAirItem => compressedAirItem.id === connectedItem.id);
                if (compressedAirItem) {
                    //compressedAirItem.validCompressedAir = this.compressedAirInventoryService.isCompressedAirValid(compressedAirItem, );
                }
            }
        }
        return compressedAirItem;
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
        let connectedCompressedAirItem: CompressedAirItem = this.getConnectedCompressedAirItem(compressedAirAssessment.connectedItem);
        let currentAssessment = connectedCompressedAirItem.connectedAssessments.find((connectedAssessment: ConnectedItem) => {
            return connectedAssessment.assessmentId === compressedAirAssessment.connectedItem.assessmentId;
        });

        // console.log(currentAssessment.connectedCompressedAirFromState.compressedAirMotor)
        // compressedAirAssessment.inputs.compressedAir_style = currentAssessment.connectedCompressedAirFromState.compressedAirEquipment.compressedAirType;
        // compressedAirAssessment.inputs.drive = currentAssessment.connectedCompressedAirFromState.compressedAirSystem.driveType;
        // compressedAirAssessment.inputs.stages = currentAssessment.connectedCompressedAirFromState.compressedAirEquipment.numStages;
        // compressedAirAssessment.inputs.line_frequency = currentAssessment.connectedCompressedAirFromState.compressedAirMotor.lineFrequency;
        // compressedAirAssessment.inputs.motor_rated_power = currentAssessment.connectedCompressedAirFromState.compressedAirMotor.motorRatedPower;
        // compressedAirAssessment.inputs.motor_rated_speed = currentAssessment.connectedCompressedAirFromState.compressedAirMotor.motorRPM;
        // compressedAirAssessment.inputs.efficiency_class = currentAssessment.connectedCompressedAirFromState.compressedAirMotor.motorEfficiencyClass;
        // compressedAirAssessment.inputs.efficiency = currentAssessment.connectedCompressedAirFromState.compressedAirMotor.motorEfficiency;
        // compressedAirAssessment.inputs.motor_rated_voltage = currentAssessment.connectedCompressedAirFromState.compressedAirMotor.motorRatedVoltage;
        // compressedAirAssessment.inputs.motor_rated_fla = currentAssessment.connectedCompressedAirFromState.compressedAirMotor.motorFullLoadAmps;
        // compressedAirAssessment.inputs.fluidType = currentAssessment.connectedCompressedAirFromState.compressedAirFluid.fluidType;

        connectedInventoryData.shouldRestoreConnectedValues = false;
        this.integrationStateService.connectedInventoryData.next(connectedInventoryData);
        return compressedAirAssessment;
    }

    restoreConnectedInventoryValues(selectedCompressedAir: CompressedAirItem, connectedInventoryData: ConnectedInventoryData) {
        // * we don't care which connected assessment
        let currentAssessment = selectedCompressedAir.connectedAssessments[0];
        // selectedCompressedAir.compressedAirEquipment.compressedAirType = currentAssessment.connectedCompressedAirFromState.compressedAirEquipment.compressedAirType;
        // selectedCompressedAir.systemProperties.driveType = currentAssessment.connectedCompressedAirFromState.compressedAirSystem.driveType;
        // selectedCompressedAir.compressedAirEquipment.numStages = currentAssessment.connectedCompressedAirFromState.compressedAirEquipment.numStages;
        // selectedCompressedAir.compressedAirMotor.lineFrequency = currentAssessment.connectedCompressedAirFromState.compressedAirMotor.lineFrequency;
        // selectedCompressedAir.compressedAirMotor.motorRatedPower = currentAssessment.connectedCompressedAirFromState.compressedAirMotor.motorRatedPower;
        // selectedCompressedAir.compressedAirMotor.motorRPM = currentAssessment.connectedCompressedAirFromState.compressedAirMotor.motorRPM;
        // selectedCompressedAir.compressedAirMotor.motorEfficiencyClass = currentAssessment.connectedCompressedAirFromState.compressedAirMotor.motorEfficiencyClass;
        // selectedCompressedAir.compressedAirMotor.motorEfficiency = currentAssessment.connectedCompressedAirFromState.compressedAirMotor.motorEfficiency;
        // selectedCompressedAir.compressedAirMotor.motorRatedVoltage = currentAssessment.connectedCompressedAirFromState.compressedAirMotor.motorRatedVoltage;
        // selectedCompressedAir.compressedAirMotor.motorFullLoadAmps = currentAssessment.connectedCompressedAirFromState.compressedAirMotor.motorFullLoadAmps;
        // selectedCompressedAir.fluid.fluidType = currentAssessment.connectedCompressedAirFromState.compressedAirFluid.fluidType;
        connectedInventoryData.shouldRestoreConnectedValues = false;
        this.integrationStateService.connectedInventoryData.next(connectedInventoryData)
    }

}


export interface CompressedAirAssessmentIntegrationResult {
    connectedItem: CompressedAirItem,
    compressedAirAssessmentInventoryItems?: Array<CompressorInventoryItem>,
    compressedAirAssessmentSystemInfo?: SystemInformation
}