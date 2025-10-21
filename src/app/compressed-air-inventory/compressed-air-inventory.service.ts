import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Settings } from '../shared/models/settings';
import { CompressedAirInventoryData, CompressedAirInventorySystem, CompressedAirItem, CompressedAirPropertyDisplayOptions, EndUse, SystemInformation, ValidCompressedAir } from './compressed-air-inventory';
import { FormGroup, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { ConvertUnitsService } from '../shared/convert-units/convert-units.service';
import { CentrifugalSpecificsCatalogService } from './compressed-air-inventory-setup/compressed-air-catalog/centrifugal-specifics-catalog/centrifugal-specifics-catalog.service';
import { CompressedAirControlsCatalogService } from './compressed-air-inventory-setup/compressed-air-catalog/compressed-air-controls-catalog/compressed-air-controls-catalog.service';
import { CompressedAirMotorCatalogService } from './compressed-air-inventory-setup/compressed-air-catalog/compressed-air-motor-catalog/compressed-air-motor-catalog.service';
import { DesignDetailsCatalogService } from './compressed-air-inventory-setup/compressed-air-catalog/design-details-catalog/design-details-catalog.service';
import { FieldMeasurementsCatalogService } from './compressed-air-inventory-setup/compressed-air-catalog/field-measurements-catalog/field-measurements-catalog.service';
import { NameplateDataCatalogService } from './compressed-air-inventory-setup/compressed-air-catalog/nameplate-data-catalog/nameplate-data-catalog.service';
import { PerformancePointsCatalogService } from './compressed-air-inventory-setup/compressed-air-catalog/performance-points-catalog/performance-points-catalog.service';
import _ from 'lodash';
import { copyObject } from '../shared/helperFunctions';
import { CompressedAirMotorIntegrationService } from '../shared/connected-inventory/compressed-air-motor-integration.service';

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
  filterInventorySummary: BehaviorSubject<FilterInventorySummary>;

  constructor(private formBuilder: UntypedFormBuilder,
    private convertUnitsService: ConvertUnitsService,
    private centrifugalSpecificsCatalogService: CentrifugalSpecificsCatalogService,
    private compressedAirControlsCatalogService: CompressedAirControlsCatalogService,
    private compressedAirMotorCatalogService: CompressedAirMotorCatalogService,
    private designDetailsCatalogService: DesignDetailsCatalogService,
    private fieldMeasurementsCatalogService: FieldMeasurementsCatalogService,
    private nameplateDataCatalogService: NameplateDataCatalogService,
    private performancePointsCatalogService: PerformancePointsCatalogService,
    private compressedAirMotorIntegrationService: CompressedAirMotorIntegrationService

  ) {
    this.setupTab = new BehaviorSubject<string>('plant-setup');
    this.mainTab = new BehaviorSubject<string>('setup');
    let inventoryData: CompressedAirInventoryData;
    this.compressedAirInventoryData = new BehaviorSubject<CompressedAirInventoryData>(inventoryData);
    this.focusedField = new BehaviorSubject<string>('default');
    this.focusedDataGroup = new BehaviorSubject<string>(undefined);
    this.modalOpen = new BehaviorSubject<boolean>(false);
    this.summaryTab = new BehaviorSubject<string>('overview');
    this.settings = new BehaviorSubject<Settings>(undefined);
    this.helpPanelTab = new BehaviorSubject<string>(undefined);
    this.showExportModal = new BehaviorSubject<boolean>(false);
    this.filterInventorySummary = new BehaviorSubject({
      selectedSystemsIds: new Array(),
      compressorTypes: new Array<number>(),
      controlTypes: new Array<number>(),
      horsepowerTypes: new Array<number>(),
    });
  }

  initInventoryData(): CompressedAirInventoryData {
    let initialSystem: CompressedAirInventorySystem = this.getNewSystem(1);
    let displayOptions: CompressedAirPropertyDisplayOptions = this.getDefaultDisplayOptions();
    let systemInformation: SystemInformation = this.getSystemInformation();
    this.setIsValidInventory({
      systemInformation: systemInformation,
      systems: [initialSystem],
      displayOptions: displayOptions
    });
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
      atmosphericPressureKnown: true
    }
  }


  setIsValidInventory(compressedAirInventoryData: CompressedAirInventoryData) {
    let isValid: boolean = true;
    if (compressedAirInventoryData) {
      compressedAirInventoryData.systems.forEach(system => {
        let isValidSystem: boolean = true;
        system.catalog.map(compressedAirItem => {
          compressedAirItem.validCompressedAir = this.isCompressorValid(compressedAirItem, compressedAirInventoryData);
          if (!compressedAirItem.validCompressedAir.isValid) {
            isValid = false;
            isValidSystem = false;
          }
        })
        system.isValid = isValidSystem
      });
    }
    compressedAirInventoryData.isValid = isValid;
  }

  isCompressorValid(compressor: CompressedAirItem, compressedAirInventoryData: CompressedAirInventoryData): ValidCompressedAir {
    let nameplateDataForm: FormGroup = this.nameplateDataCatalogService.getFormFromNameplateData(compressor.nameplateData);
    let compressedAirMotorForm: FormGroup = this.compressedAirMotorCatalogService.getFormFromMotorProperties(compressor.compressedAirMotor);
    let controlsForm: FormGroup = this.compressedAirControlsCatalogService.getFormFromControlsProperties(compressor.compressedAirControlsProperties, compressor.nameplateData.compressorType);
    let designDetailsForm: FormGroup = this.designDetailsCatalogService.getFormFromDesignDetails(compressor.compressedAirDesignDetailsProperties, compressor.nameplateData.compressorType, compressor.compressedAirControlsProperties.controlType);
    let fieldMeasurementsForm: FormGroup = this.fieldMeasurementsCatalogService.getFormFromFieldMeasurements(compressor.fieldMeasurements);
    let performancePointsIsValid: boolean = this.performancePointsCatalogService.checkPerformancePointsValid(compressor, compressedAirInventoryData.systemInformation);
    let centrifugalSpecificsForm: UntypedFormGroup = this.centrifugalSpecificsCatalogService.getCentrifugalFormFromObj(compressor);
    let centrifugalSpecificsFormIsValid: boolean
    if (compressor.nameplateData.compressorType == 6) {
      centrifugalSpecificsFormIsValid = centrifugalSpecificsForm.valid;
    } else {
      centrifugalSpecificsFormIsValid = true;
    }

    return {
      isValid: nameplateDataForm.valid && compressedAirMotorForm.valid && controlsForm.valid && designDetailsForm.valid && centrifugalSpecificsFormIsValid && fieldMeasurementsForm.valid && performancePointsIsValid,
      nameplateDataValid: nameplateDataForm.valid,
      compressedAirMotorValid: compressedAirMotorForm.valid,
      compressedAirControlsValid: controlsForm.valid,
      compressedAirDesignDetailsValid: designDetailsForm.valid,
      compressedAirCentrifugalSpecifics: centrifugalSpecificsFormIsValid,
      compressedAirPerformancePointsValid: performancePointsIsValid,
      compressedAirFieldMeasurementsValid: fieldMeasurementsForm.valid
    }
  }

  getNewSystem(systemNum: number): CompressedAirInventorySystem {
    let systemId: string = Math.random().toString(36).substr(2, 9);
    let initCompressor: CompressedAirItem = this.getNewCompressor(systemId);
    let endUses: Array<EndUse> = this.getNewEndUses();
    return {
      name: 'System ' + systemNum,
      operatingHours: 8760,
      totalAirStorage: 3000,
      averageLeakRate: 2100,
      knownTotalAirflow: 10000,
      description: '',
      id: systemId,
      catalog: [initCompressor],
      endUses: endUses
    }
  }
  getNewEndUses() {
    let endUseId: string = Math.random().toString(36).substr(2, 9);
    return [{
      endUseId: endUseId,
      modifiedDate: new Date(),
      endUseName: "Pneumatic Tools 1",
      averageRequiredPressure: 110,
      location: "Production Line 1",
      endUseDescription: "Total of all hand tools found on production line 1",
      averageAirflow: 1460,
      averagePercentCapacity: 16.82,
      regulated: false,
      averageMeasuredPressure: 126,
      averageExcessPressure: 16,
    }]
  }

  getNewCompressor(systemId: string, catalog?: CompressedAirItem[]): CompressedAirItem {
    let compressorName: string = 'Compressor 1';
    if (catalog) {
      compressorName = 'Compressor ' + (catalog.length + 1);
    }
    return {
      id: Math.random().toString(36).substr(2, 9),
      systemId: systemId,
      suiteDbItemId: undefined,
      description: '',
      notes: '',
      name: compressorName,
      centrifugalSpecifics: {
        surgeAirflow: undefined,
        maxFullLoadPressure: undefined,
        maxFullLoadCapacity: undefined,
        minFullLoadPressure: undefined,
        minFullLoadCapacity: undefined
      },
      nameplateData: {
        compressorType: undefined,
        fullLoadOperatingPressure: undefined,
        fullLoadRatedCapacity: undefined,
        totalPackageInputPower: undefined
      },
      fieldMeasurements: {
        yearlyOperatingHours: undefined,
      },
      compressedAirMotor: {
        motorPower: undefined,
        motorFullLoadAmps: undefined
      },
      compressedAirControlsProperties: {
        controlType: undefined,
        unloadPointCapacity: undefined,
        numberOfUnloadSteps: undefined,
        automaticShutdown: false,
        unloadSumpPressure: undefined,
      },
      compressedAirDesignDetailsProperties: {
        blowdownTime: undefined,
        modulatingPressureRange: undefined,
        inputPressure: undefined,
        designEfficiency: undefined,
        serviceFactor: undefined,
        noLoadPowerFM: undefined,
        noLoadPowerUL: undefined,
        maxFullFlowPressure: undefined,
        estimatedTimeLoaded: undefined,
        averageLoadFactor: undefined,
        motorEfficiencyAtLoad: undefined
      },
      compressedAirPerformancePointsProperties: {
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
        maxFullFlowPressure: true,
        estimatedTimeLoaded: true,
        averageLoadFactor: true,
        motorEfficiencyAtLoad: true
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
    if (selectedCompressedAir.connectedItem) {
     await this.compressedAirMotorIntegrationService.removeMotorConnectedItem(selectedCompressedAir);
     compressedAirInventoryData.hasConnectedInventoryItems = false;
    }
    this.setIsValidInventory(compressedAirInventoryData);
    this.compressedAirInventoryData.next(compressedAirInventoryData);
  }

  /**
   * TODO change name - Actually updates compressedAirInventoryData, does NOT push changes to selectedCompressor
   * @param selectedCompressedAir CompressedAirItem to update in the inventory data
   */
  updateCompressedAirInventoryData(selectedCompressedAir: CompressedAirItem) {
    let compressedAirInventoryData: CompressedAirInventoryData = this.compressedAirInventoryData.getValue();
    let isValid: boolean = true;
    compressedAirInventoryData.systems.map(system => {
      let isValidSystem: boolean = true;
      system.catalog.map(compressedAirItem => {
        if (selectedCompressedAir.id === compressedAirItem.id) {
          compressedAirItem = selectedCompressedAir;
        }
        let isValidCompressedAir = this.isCompressorValid(compressedAirItem, compressedAirInventoryData);
        compressedAirItem.validCompressedAir = isValidCompressedAir;
        if (!isValidCompressedAir.isValid) {
          isValid = false;
          isValidSystem = false;
        }
      })
      system.isValid = isValidSystem;
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


  filterCompressedAirInventoryData(inventoryData: CompressedAirInventoryData, filterInventorySummary: FilterInventorySummary): CompressedAirInventoryData {
    let filteredInventoryData: CompressedAirInventoryData = copyObject(inventoryData);
    if (filterInventorySummary.selectedSystemsIds.length != 0) {
      filteredInventoryData.systems = _.filter(filteredInventoryData.systems, (department) => {
        return _.find(filterInventorySummary.selectedSystemsIds, (id) => { return department.id == id }) != undefined;
      });
    }
    if (filterInventorySummary.compressorTypes.length != 0) {
      filteredInventoryData.systems.forEach(system => {
        system.catalog = _.filter(system.catalog, (compressorItem) => {
          return _.includes(filterInventorySummary.compressorTypes, compressorItem.nameplateData.compressorType);
        })
      });
    }
    if (filterInventorySummary.controlTypes.length != 0) {
      filteredInventoryData.systems.forEach(system => {
        system.catalog = _.filter(system.catalog, (compressorItem) => {
          return _.includes(filterInventorySummary.controlTypes, compressorItem.compressedAirControlsProperties.controlType);
        })
      });
    }
    if (filterInventorySummary.horsepowerTypes.length != 0) {
      filteredInventoryData.systems.forEach(system => {
        system.catalog = _.filter(system.catalog, (compressorItem) => {
          return _.includes(filterInventorySummary.horsepowerTypes, compressorItem.compressedAirMotor.motorPower);
        })
      });
    }
    return filteredInventoryData;
  }

  setIsValidSystem(compressedAirInventoryData: CompressedAirInventoryData, system: CompressedAirInventorySystem): boolean {
    let isValid: boolean = true;
    let isValidSystem: boolean = true;
    if (compressedAirInventoryData) {
      system.catalog.map(compressedAirItem => {
        compressedAirItem.validCompressedAir = this.isCompressorValid(compressedAirItem, compressedAirInventoryData);
        if (!compressedAirItem.validCompressedAir.isValid) {
          isValid = false;
          isValidSystem = false;
        }
      });
      system.isValid = isValidSystem
    }
    compressedAirInventoryData.isValid = isValid;
    return isValidSystem;
  }


}

export interface FilterInventorySummary {
  selectedSystemsIds: Array<string>,
  compressorTypes: Array<number>,
  controlTypes: Array<number>,
  horsepowerTypes: Array<number>,
}