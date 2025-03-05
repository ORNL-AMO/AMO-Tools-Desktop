import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Settings } from '../shared/models/settings';
import { CompressedAirInventoryData, CompressedAirInventorySystem, CompressedAirItem, CompressedAirPropertyDisplayOptions, SystemInformation, ValidCompressedAir } from './compressed-air-inventory';
import { FormGroup, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { ConvertUnitsService } from '../shared/convert-units/convert-units.service';
import { CentrifugalSpecificsCatalogService } from './compressed-air-inventory-setup/compressed-air-catalog/centrifugal-specifics-catalog/centrifugal-specifics-catalog.service';
import { CompressedAirControlsCatalogService } from './compressed-air-inventory-setup/compressed-air-catalog/compressed-air-controls-catalog/compressed-air-controls-catalog.service';
import { CompressedAirMotorCatalogService } from './compressed-air-inventory-setup/compressed-air-catalog/compressed-air-motor-catalog/compressed-air-motor-catalog.service';
import { DesignDetailsCatalogService } from './compressed-air-inventory-setup/compressed-air-catalog/design-details-catalog/design-details-catalog.service';
import { FieldMeasurementsCatalogService } from './compressed-air-inventory-setup/compressed-air-catalog/field-measurements-catalog/field-measurements-catalog.service';
import { NameplateDataCatalogService } from './compressed-air-inventory-setup/compressed-air-catalog/nameplate-data-catalog/nameplate-data-catalog.service';
import { PerformancePointsCatalogService } from './compressed-air-inventory-setup/compressed-air-catalog/performance-points-catalog/performance-points-catalog.service';

@Injectable()
export class CompressedAirInventoryService {

  mainTab: BehaviorSubject<string>;
  setupTab: BehaviorSubject<string>;
  summaryTab: BehaviorSubject<string>;
  compressedAirInventoryData: BehaviorSubject<CompressedAirInventoryData>;
  focusedField: BehaviorSubject<string>;
  focusedDataGroup: BehaviorSubject<string>;
  modalOpen: BehaviorSubject<boolean>;
  settings: BehaviorSubject<Settings>;
  helpPanelTab: BehaviorSubject<string>;
  showExportModal: BehaviorSubject<boolean>;
  currentInventoryId: number;

  constructor(private formBuilder: UntypedFormBuilder,
    private convertUnitsService: ConvertUnitsService,
    private centrifugalSpecificsCatalogService: CentrifugalSpecificsCatalogService,
    private compressedAirControlsCatalogService: CompressedAirControlsCatalogService,
    private compressedAirMotorCatalogService: CompressedAirMotorCatalogService,
    private designDetailsCatalogService: DesignDetailsCatalogService,
    private fieldMeasurementsCatalogService: FieldMeasurementsCatalogService,
    private nameplateDataCatalogService: NameplateDataCatalogService,
    private performancePointsCatalogService: PerformancePointsCatalogService

  ) {
    this.setupTab = new BehaviorSubject<string>('plant-setup');
    this.mainTab = new BehaviorSubject<string>('setup');
    let inventoryData: CompressedAirInventoryData; //= this.initInventoryData();
    this.compressedAirInventoryData = new BehaviorSubject<CompressedAirInventoryData>(inventoryData);
    this.focusedField = new BehaviorSubject<string>('default');
    this.focusedDataGroup = new BehaviorSubject<string>(undefined);
    this.modalOpen = new BehaviorSubject<boolean>(false);
    this.summaryTab = new BehaviorSubject<string>('overview');
    this.settings = new BehaviorSubject<Settings>(undefined);
    this.helpPanelTab = new BehaviorSubject<string>(undefined);
    this.showExportModal = new BehaviorSubject<boolean>(false);
    // this.filterInventorySummary = new BehaviorSubject({
    //   selectedSystemIds: new Array(),
    //   pumpTypes: new Array(),
    //   motorRatedPowerValues: new Array(),
    //   statusValues: new Array()
    // });
  }

  initInventoryData(): CompressedAirInventoryData {
    let initialSystem: CompressedAirInventorySystem = this.getNewSystem(1);
    let displayOptions: CompressedAirPropertyDisplayOptions = this.getDefaultDisplayOptions();
    let systemInformation: SystemInformation = this.getSystemInformation();
    return {
      systemInformation: systemInformation,
      systems: [initialSystem],
      displayOptions: displayOptions
    }
  }

  getSystemInformation(): SystemInformation {
    return {
      systemElevation: null,
      atmosphericPressure: 14.7,
      atmosphericPressureKnown: true,
    }
  }


  setIsValidInventory(compressedAirInventoryData: CompressedAirInventoryData) {
    let isValid: boolean = true;
    // if (compressedAirInventoryData) {
    //   compressedAirInventoryData.systems.forEach(dept => {
    //     let isValidSystem: boolean = true;
    //     dept.catalog.map(compressedAirItem => {
    //       compressedAirItem.validCompressedAir = this.isCompressedAirValid(compressedAirItem);
    //       if (!compressedAirItem.validCompressedAir.isValid) {
    //         isValid = false;
    //         isValidSystem = false;
    //       }
    //     })
    //     dept.isValid = isValidSystem
    //   });
    // }
    compressedAirInventoryData.isValid = isValid;
  }

  // isCompressedAirValid(compressor: CompressedAirItem): ValidCompressedAir {
  //   let nameplateDataForm: FormGroup = this.nameplateDataCatalogService.getFormFromNameplateData(compressor.nameplateData);
  //   let compressedAirMotorForm: FormGroup = this.compressedAirMotorCatalogService.getFormFromMotorProperties(compressor.compressedAirMotor);
  //   let controlsForm: FormGroup = this.compressedAirControlsCatalogService.getFormFromControlsProperties(compressor.compressedAirControlsProperties, compressor.nameplateData.compressorType);
  //   let designDetailsForm: FormGroup = this.designDetailsCatalogService.getFormFromDesignDetails(compressor.compressedAirDesignDetailsProperties, compressor.nameplateData.compressorType, compressor.compressedAirControlsProperties.controlType);
  //   let fieldMeasurementsForm: FormGroup =this.fieldMeasurementsCatalogService.getFormFromFieldMeasurements(compressor.fieldMeasurements);
  //   let centrifugalSpecificsFormIsValid: boolean
  //   let centrifugalSpecificsForm: UntypedFormGroup = this.centrifugalSpecificsCatalogService.getCentrifugalFormFromObj(compressor);
  //   if (compressor.nameplateData.compressorType == 6){
  //     centrifugalSpecificsFormIsValid = centrifugalSpecificsForm.valid;
  //   } else {
  //     centrifugalSpecificsFormIsValid = true;
  //   }

  //   let compressedAirInventoryData: CompressedAirInventoryData = this.compressedAirInventoryData.getValue();
  //   //let performancePointsFormIsValid: boolean = this.performancePointsCatalogService.checkPerformancePointsValid(compressor, compressedAirInventoryData.systemInformation);
    
  //   let fullLoadForm = this.performancePointsCatalogService.getPerformancePointFormFromObj( compressor.compressedAirPerformancePointsProperties.fullLoad, compressor, 'fullLoad' , compressedAirInventoryData.systemInformation);
  //   let maxFullFlowForm = this.performancePointsCatalogService.getPerformancePointFormFromObj( compressor.compressedAirPerformancePointsProperties.maxFullFlow, compressor, 'maxFullFlow' , compressedAirInventoryData.systemInformation);
  //   let noLoadForm = this.performancePointsCatalogService.getPerformancePointFormFromObj( compressor.compressedAirPerformancePointsProperties.noLoad, compressor, 'noLoad' , compressedAirInventoryData.systemInformation);
  //   let blowoffForm = this.performancePointsCatalogService.getPerformancePointFormFromObj( compressor.compressedAirPerformancePointsProperties.blowoff, compressor, 'blowoff' , compressedAirInventoryData.systemInformation);
  //   let unloadPointForm = this.performancePointsCatalogService.getPerformancePointFormFromObj( compressor.compressedAirPerformancePointsProperties.unloadPoint, compressor, 'unloadPoint' , compressedAirInventoryData.systemInformation);
  //   let midTurndownForm = this.performancePointsCatalogService.getPerformancePointFormFromObj( compressor.compressedAirPerformancePointsProperties.midTurndown, compressor, 'midTurndown' , compressedAirInventoryData.systemInformation);
  //   let turndownForm = this.performancePointsCatalogService.getPerformancePointFormFromObj( compressor.compressedAirPerformancePointsProperties.turndown, compressor, 'turndown' , compressedAirInventoryData.systemInformation);
  //   let performancePointsFormIsValid: boolean = fullLoadForm.valid && maxFullFlowForm.valid && noLoadForm.valid && blowoffForm.valid && unloadPointForm.valid && midTurndownForm.valid && turndownForm.valid;
  //   return {
  //     isValid: nameplateDataForm.valid && compressedAirMotorForm.valid && controlsForm.valid && designDetailsForm.valid && centrifugalSpecificsFormIsValid && fieldMeasurementsForm.valid && performancePointsFormIsValid,
  //     nameplateDataValid: nameplateDataForm.valid,
  //     compressedAirMotorValid: compressedAirMotorForm.valid,
  //     compressedAirControlsValid: controlsForm.valid,
  //     compressedAirDesignDetailsValid: designDetailsForm.valid,
  //     compressedAirCentrifugalSpecifics: centrifugalSpecificsFormIsValid,
  //     compressedAirPerformancePointsValid: performancePointsFormIsValid,
  //     compressedAirFieldMeasurementsValid: fieldMeasurementsForm.valid
  //   }
  // }

  getNewSystem(systemNum: number): CompressedAirInventorySystem {
    let systemId: string = Math.random().toString(36).substr(2, 9);
    let initCompressor: CompressedAirItem = this.getNewCompressor(systemId);
    return {
      name: 'System ' + systemNum,
      operatingHours: 8760,
      totalAirStorage: 3000,
      description: '',
      id: systemId,
      catalog: [initCompressor]
    }
  }

  getNewCompressor(systemId: string): CompressedAirItem {
    return {
      id: Math.random().toString(36).substr(2, 9),
      systemId: systemId,
      suiteDbItemId: undefined,
      description: '',
      notes: '',
      name: 'New Compressor',
      centrifugalSpecifics: {
        surgeAirflow: null,
        maxFullLoadPressure: null,
        maxFullLoadCapacity: null,
        minFullLoadPressure: null,
        minFullLoadCapacity: null
      },
      nameplateData: {
        compressorType: 1,
        fullLoadOperatingPressure: 100,
        fullLoadRatedCapacity: 1857,
        totalPackageInputPower: 290.1
      },
      fieldMeasurements: {
        yearlyOperatingHours: 8760,
      },
      compressedAirMotor: {
        motorPower: 350,
        motorFullLoadAmps: 385
      },
      compressedAirControlsProperties: {
        controlType: 1,
        unloadPointCapacity: 100,
        numberOfUnloadSteps: 2,
        automaticShutdown: true,
        unloadSumpPressure: 15,
      },
      compressedAirDesignDetailsProperties: {
        blowdownTime: 40,
        modulatingPressureRange: 50,
        inputPressure: 14.5,
        designEfficiency: 94.5,
        serviceFactor: 1.15,
        noLoadPowerFM: 20,
        noLoadPowerUL: 20,
        maxFullFlowPressure: 110
      },
      compressedAirPerformancePointsProperties: {
        fullLoad: {
          dischargePressure: 100,
          isDefaultPower: true,
          airflow: 1857,
          isDefaultAirFlow: true,
          power: 290.1,
          isDefaultPressure: true
        },
        maxFullFlow: {
          dischargePressure: 110,
          isDefaultPower: true,
          airflow: 1843,
          isDefaultAirFlow: true,
          power: 305.9,
          isDefaultPressure: true
        },
        unloadPoint: {
          isDefaultPower: true,
          isDefaultAirFlow: true,
          isDefaultPressure: true,
          power: undefined,
          airflow: undefined,
          dischargePressure: undefined,
        },
        noLoad: {
          dischargePressure: 15,
          isDefaultPower: true,
          airflow: 0,
          isDefaultAirFlow: true,
          power: 59.5,
          isDefaultPressure: true
        },
        blowoff: {
          isDefaultPower: true,
          isDefaultAirFlow: true,
          isDefaultPressure: true,
          power: undefined,
          airflow: undefined,
          dischargePressure: undefined,
        },
        midTurndown: {
          isDefaultPower: true,
          isDefaultAirFlow: true,
          isDefaultPressure: true,
          power: undefined,
          airflow: undefined,
          dischargePressure: undefined,
        },
        turndown: {
          isDefaultPower: true,
          isDefaultAirFlow: true,
          isDefaultPressure: true,
          power: undefined,
          airflow: undefined,
          dischargePressure: undefined,
        }
      },
    }
  }


  getDefaultDisplayOptions(): CompressedAirPropertyDisplayOptions {
    return {
      nameplateDataOptions: {
        displayNameplateData: true,
        compressorType: true,
        fullLoadOperatingPressure: true,
        fullLoadRatedCapacity: true,
        totalPackageInputPower: true
      },
      fieldMeasurementsOptions: {
        displayFieldMeasurements: true,
        yearlyOperatingHours: true,
      },
      compressedAirMotorPropertiesOptions: {
        displayCompressedAirMotorProperties: true,
        motorPower: true,
        motorFullLoadAmps: true,
      },
      compressedAirControlsPropertiesOptions: {
        displayCompressedAirControlsProperties: true,
        controlType: true,
        unloadPointCapacity: true,
        numberOfUnloadSteps: true,
        automaticShutdown: true,
        unloadSumpPressure: true,
      },
      compressedAirDesignDetailsPropertiesOptions: {
        displayCompressedAirDesignDetailsProperties: true,
        blowdownTime: true,
        modulatingPressureRange: true,
        inputPressure: true,
        designEfficiency: true,
        serviceFactor: true,
        noLoadPowerFM: true,
        noLoadPowerUL: true,
        maxFullFlowPressure: true
      },
      compressedAirPerformancePointsPropertiesOptions: {
        displayCompressedAirPerformancePointsProperties: true
      }
    }

  }

  async deleteCompressedAirItem(selectedCompressedAir: CompressedAirItem) {
    let compressedAirInventoryData: CompressedAirInventoryData = this.compressedAirInventoryData.getValue();
    let selectedSystemIndex: number = compressedAirInventoryData.systems.findIndex(system => { return system.id == selectedCompressedAir.systemId });
    let compressedAirItemIndex: number = compressedAirInventoryData.systems[selectedSystemIndex].catalog.findIndex(compressedAirItem => { return compressedAirItem.id == selectedCompressedAir.id });
    compressedAirInventoryData.systems[selectedSystemIndex].catalog.splice(compressedAirItemIndex, 1);
    // if (selectedCompressedAir.connectedItem) {
    //  await this.motorIntegrationService.removeMotorConnectedItem(selectedCompressedAir);
    //  compressedAirInventoryData.hasConnectedInventoryItems = false;
    // }
    this.setIsValidInventory(compressedAirInventoryData);
    this.compressedAirInventoryData.next(compressedAirInventoryData);
  }

  updateCompressedAirItem(selectedCompressedAir: CompressedAirItem) {
    let compressedAirInventoryData: CompressedAirInventoryData = this.compressedAirInventoryData.getValue();
    let isValid: boolean = true;
    compressedAirInventoryData.systems.map(dept => {
      let isValidSystem: boolean = true;
      dept.catalog.map(compressedAirItem => {
        if (selectedCompressedAir.id === compressedAirItem.id) {
          compressedAirItem = selectedCompressedAir;
        }
        // let isValidCompressedAir = this.isCompressedAirValid(compressedAirItem);
        // compressedAirItem.validCompressedAir = isValidCompressedAir;
        // if (!isValidCompressedAir.isValid) {
        //   isValid = false;
        //   isValidSystem = false;
        // }
      })
      dept.isValid = isValidSystem;
    });
    compressedAirInventoryData.isValid = isValid;
    this.compressedAirInventoryData.next(compressedAirInventoryData);
  }

  getFormFromObj(obj: SystemInformation, settings: Settings): UntypedFormGroup {
    let maxAtmosphericPressure: number = 16;
    if (settings && settings.unitsOfMeasure == 'Metric') {
      maxAtmosphericPressure = this.convertUnitsService.value(maxAtmosphericPressure).from('psia').to('kPaa');
      maxAtmosphericPressure = this.convertUnitsService.roundVal(maxAtmosphericPressure, 2);
    }
    let form: UntypedFormGroup = this.formBuilder.group({
      systemElevation: [obj.systemElevation, [Validators.min(0), Validators.max(29000)]],
      atmosphericPressure: [obj.atmosphericPressure, [Validators.required, Validators.min(0), Validators.max(maxAtmosphericPressure)]],
      atmosphericPressureKnown: [obj.atmosphericPressureKnown],

    });

    return form;
  }

  updateObjFromForm(form: UntypedFormGroup, systemInformation: SystemInformation): SystemInformation {
    systemInformation.systemElevation = form.controls.systemElevation.value;
    systemInformation.atmosphericPressure = form.controls.atmosphericPressure.value;
    systemInformation.atmosphericPressureKnown = form.controls.atmosphericPressureKnown.value;
    return systemInformation;
  }




}
