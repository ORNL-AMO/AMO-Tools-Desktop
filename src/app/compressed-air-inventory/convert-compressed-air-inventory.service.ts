import { Injectable } from '@angular/core';
import { ConvertUnitsService } from '../shared/convert-units/convert-units.service';
import { CentrifugalSpecifics, CompressedAirControlsProperties, CompressedAirDesignDetailsProperties, CompressedAirInventoryData, CompressedAirInventorySystem, CompressedAirMotorProperties, CompressedAirPerformancePointsProperties, EndUse, FieldMeasurements, NameplateData, PerformancePoint, SystemInformation } from './compressed-air-inventory';
import { Settings } from '../shared/models/settings';

@Injectable()
export class ConvertCompressedAirInventoryService {

  constructor(private convertUnitsService: ConvertUnitsService) { }

  convertInventoryData(compressedAirInventoryData: CompressedAirInventoryData, oldSettings: Settings, newSettings: Settings): CompressedAirInventoryData {
    compressedAirInventoryData.systemInformation = this.convertSystemInformation(compressedAirInventoryData.systemInformation, oldSettings, newSettings);

    compressedAirInventoryData.systems.forEach(system => {
      system = this.convertCompressedAirInventorySystem(system, oldSettings, newSettings);
      system.endUses.forEach(endUse => {
        endUse = this.convertEndUse(endUse, oldSettings, newSettings);
      });
      system.catalog.forEach(compressedAirItem => {
        compressedAirItem.nameplateData = this.convertNameplateData(compressedAirItem.nameplateData, oldSettings, newSettings);
        compressedAirItem.compressedAirMotor = this.convertCompressedAirMotor(compressedAirItem.compressedAirMotor, oldSettings, newSettings);
        compressedAirItem.compressedAirControlsProperties = this.convertCompressedAirControlsProperties(compressedAirItem.compressedAirControlsProperties, oldSettings, newSettings);
        compressedAirItem.compressedAirDesignDetailsProperties = this.convertCompressedAirDesignDetailsProperties(compressedAirItem.compressedAirDesignDetailsProperties, oldSettings, newSettings);
        compressedAirItem.compressedAirPerformancePointsProperties = this.convertCompressedAirPerformancePointsProperties(compressedAirItem.compressedAirPerformancePointsProperties, oldSettings, newSettings);
        compressedAirItem.centrifugalSpecifics = this.convertCentrifugalSpecifics(compressedAirItem.centrifugalSpecifics, oldSettings, newSettings);
      });
    });
    return compressedAirInventoryData;
  }

  convertEndUse(endUse: EndUse, oldSettings: Settings, newSettings: Settings): EndUse {
    if (oldSettings.unitsOfMeasure == 'Metric' && newSettings.unitsOfMeasure == 'Imperial') {
      endUse.averageRequiredPressure = this.convertUnitsService.value(endUse.averageRequiredPressure).from('barg').to('psig');
      endUse.averageAirflow = this.convertUnitsService.value(endUse.averageAirflow).from('m3/min').to('ft3/min');
      endUse.averageMeasuredPressure = this.convertUnitsService.value(endUse.averageMeasuredPressure).from('barg').to('psig');      
      endUse.averageExcessPressure = this.convertUnitsService.value(endUse.averageExcessPressure).from('barg').to('psig');

    } else if (oldSettings.unitsOfMeasure == 'Imperial' && newSettings.unitsOfMeasure == 'Metric') {
      endUse.averageRequiredPressure = this.convertUnitsService.value(endUse.averageRequiredPressure).from('psig').to('barg');
      endUse.averageAirflow = this.convertUnitsService.value(endUse.averageAirflow).from('ft3/min').to('m3/min');
      endUse.averageMeasuredPressure = this.convertUnitsService.value(endUse.averageMeasuredPressure).from('psig').to('barg');
      endUse.averageExcessPressure = this.convertUnitsService.value(endUse.averageExcessPressure).from('psig').to('barg');
    }
    endUse.averageRequiredPressure = this.convertUnitsService.roundVal(endUse.averageRequiredPressure, 2);
    endUse.averageAirflow = this.convertUnitsService.roundVal(endUse.averageAirflow, 2);
    endUse.averageMeasuredPressure = this.convertUnitsService.roundVal(endUse.averageMeasuredPressure, 2);
    endUse.averageExcessPressure = this.convertUnitsService.roundVal(endUse.averageExcessPressure, 2);

    return endUse;
  }



  convertSystemInformation(systemInformation: SystemInformation, oldSettings: Settings, newSettings: Settings): SystemInformation {
    if (oldSettings.unitsOfMeasure == 'Metric' && newSettings.unitsOfMeasure == 'Imperial') {
      systemInformation.systemElevation = this.convertUnitsService.value(systemInformation.systemElevation).from('m').to('ft');
      systemInformation.atmosphericPressure = this.convertUnitsService.value(systemInformation.atmosphericPressure).from('kPaa').to('psia');
    } else if (oldSettings.unitsOfMeasure == 'Imperial' && newSettings.unitsOfMeasure == 'Metric') {
      systemInformation.atmosphericPressure = this.convertUnitsService.value(systemInformation.atmosphericPressure).from('psia').to('kPaa');
      systemInformation.systemElevation = this.convertUnitsService.value(systemInformation.systemElevation).from('ft').to('m');
    }
    systemInformation.atmosphericPressure = this.convertUnitsService.roundVal(systemInformation.atmosphericPressure, 2);
    systemInformation.systemElevation = this.convertUnitsService.roundVal(systemInformation.systemElevation, 2);
    return systemInformation;
  }

  convertCompressedAirInventorySystem(compressedAirInventorySystem: CompressedAirInventorySystem, oldSettings: Settings, newSettings: Settings): CompressedAirInventorySystem {
    if (oldSettings.unitsOfMeasure == 'Metric' && newSettings.unitsOfMeasure == 'Imperial') {
      compressedAirInventorySystem.totalAirStorage = this.convertUnitsService.value(compressedAirInventorySystem.totalAirStorage).from('m3').to('gal');
      compressedAirInventorySystem.averageLeakRate = this.convertUnitsService.value(compressedAirInventorySystem.averageLeakRate).from('m3/min').to('ft3/min');
      compressedAirInventorySystem.knownTotalAirflow = this.convertUnitsService.value(compressedAirInventorySystem.knownTotalAirflow).from('m3/min').to('ft3/min');
    } else if (oldSettings.unitsOfMeasure == 'Imperial' && newSettings.unitsOfMeasure == 'Metric') {
      compressedAirInventorySystem.totalAirStorage = this.convertUnitsService.value(compressedAirInventorySystem.totalAirStorage).from('gal').to('m3');
      compressedAirInventorySystem.averageLeakRate = this.convertUnitsService.value(compressedAirInventorySystem.averageLeakRate).from('ft3/min').to('m3/min');
      compressedAirInventorySystem.knownTotalAirflow = this.convertUnitsService.value(compressedAirInventorySystem.knownTotalAirflow).from('ft3/min').to('m3/min');
    }
    compressedAirInventorySystem.totalAirStorage = this.convertUnitsService.roundVal(compressedAirInventorySystem.totalAirStorage, 2);
    compressedAirInventorySystem.averageLeakRate = this.convertUnitsService.roundVal(compressedAirInventorySystem.averageLeakRate, 2);
    compressedAirInventorySystem.knownTotalAirflow = this.convertUnitsService.roundVal(compressedAirInventorySystem.knownTotalAirflow, 2);
    return compressedAirInventorySystem;
  }



  convertCentrifugalSpecifics(centrifugalSpecifics: CentrifugalSpecifics, oldSettings: Settings, newSettings: Settings): CentrifugalSpecifics {
    if (oldSettings.unitsOfMeasure == 'Metric' && newSettings.unitsOfMeasure == 'Imperial') {
      centrifugalSpecifics.surgeAirflow = this.convertUnitsService.value(centrifugalSpecifics.surgeAirflow).from('m3/min').to('ft3/min');
      centrifugalSpecifics.maxFullLoadPressure = this.convertUnitsService.value(centrifugalSpecifics.maxFullLoadPressure).from('barg').to('psig');
      centrifugalSpecifics.maxFullLoadCapacity = this.convertUnitsService.value(centrifugalSpecifics.maxFullLoadCapacity).from('m3/min').to('ft3/min');
      centrifugalSpecifics.minFullLoadPressure = this.convertUnitsService.value(centrifugalSpecifics.minFullLoadPressure).from('barg').to('psig');
      centrifugalSpecifics.minFullLoadCapacity = this.convertUnitsService.value(centrifugalSpecifics.minFullLoadCapacity).from('m3/min').to('ft3/min');

    } else if (oldSettings.unitsOfMeasure == 'Imperial' && newSettings.unitsOfMeasure == 'Metric') {
      centrifugalSpecifics.surgeAirflow = this.convertUnitsService.value(centrifugalSpecifics.surgeAirflow).from('ft3/min').to('m3/min');
      centrifugalSpecifics.maxFullLoadPressure = this.convertUnitsService.value(centrifugalSpecifics.maxFullLoadPressure).from('psig').to('barg');
      centrifugalSpecifics.maxFullLoadCapacity = this.convertUnitsService.value(centrifugalSpecifics.maxFullLoadCapacity).from('ft3/min').to('m3/min');
      centrifugalSpecifics.minFullLoadPressure = this.convertUnitsService.value(centrifugalSpecifics.minFullLoadPressure).from('psig').to('barg');
      centrifugalSpecifics.minFullLoadCapacity = this.convertUnitsService.value(centrifugalSpecifics.minFullLoadCapacity).from('ft3/min').to('m3/min');
    }
    centrifugalSpecifics.surgeAirflow = this.convertUnitsService.roundVal(centrifugalSpecifics.surgeAirflow, 2);
    centrifugalSpecifics.maxFullLoadPressure = this.convertUnitsService.roundVal(centrifugalSpecifics.maxFullLoadPressure, 2);
    centrifugalSpecifics.maxFullLoadCapacity = this.convertUnitsService.roundVal(centrifugalSpecifics.maxFullLoadCapacity, 2);
    centrifugalSpecifics.minFullLoadPressure = this.convertUnitsService.roundVal(centrifugalSpecifics.minFullLoadPressure, 2);
    centrifugalSpecifics.minFullLoadCapacity = this.convertUnitsService.roundVal(centrifugalSpecifics.minFullLoadCapacity, 2);

    return centrifugalSpecifics;
  }

  convertCompressedAirPerformancePointsProperties(performancePoints: CompressedAirPerformancePointsProperties, oldSettings: Settings, newSettings: Settings): CompressedAirPerformancePointsProperties {
    performancePoints.fullLoad = this.convertPerformancePoint(performancePoints.fullLoad, oldSettings, newSettings);
    performancePoints.maxFullFlow = this.convertPerformancePoint(performancePoints.maxFullFlow, oldSettings, newSettings);
    if (performancePoints.midTurndown && performancePoints.turndown) {
      performancePoints.midTurndown = this.convertPerformancePoint(performancePoints.midTurndown, oldSettings, newSettings);
      performancePoints.turndown = this.convertPerformancePoint(performancePoints.turndown, oldSettings, newSettings);
    }
    performancePoints.unloadPoint = this.convertPerformancePoint(performancePoints.unloadPoint, oldSettings, newSettings);
    performancePoints.noLoad = this.convertPerformancePoint(performancePoints.noLoad, oldSettings, newSettings);
    performancePoints.blowoff = this.convertPerformancePoint(performancePoints.blowoff, oldSettings, newSettings);

    return performancePoints;
  }

  convertPerformancePoint(performancePoint: PerformancePoint, oldSettings: Settings, newSettings: Settings): PerformancePoint {
    if (oldSettings.unitsOfMeasure == 'Metric' && newSettings.unitsOfMeasure == 'Imperial') {
      performancePoint.dischargePressure = this.convertUnitsService.value(performancePoint.dischargePressure).from('barg').to('psig');
      performancePoint.airflow = this.convertUnitsService.value(performancePoint.airflow).from('m3/min').to('ft3/min');

    } else if (oldSettings.unitsOfMeasure == 'Imperial' && newSettings.unitsOfMeasure == 'Metric') {
      performancePoint.dischargePressure = this.convertUnitsService.value(performancePoint.dischargePressure).from('psig').to('barg');
      performancePoint.airflow = this.convertUnitsService.value(performancePoint.airflow).from('ft3/min').to('m3/min');
    }
    performancePoint.dischargePressure = this.convertUnitsService.roundVal(performancePoint.dischargePressure, 2);
    performancePoint.airflow = this.convertUnitsService.roundVal(performancePoint.airflow, 2);

    return performancePoint;
  }

  convertCompressedAirDesignDetailsProperties(compressedAirDesignDetailsProperties: CompressedAirDesignDetailsProperties, oldSettings: Settings, newSettings: Settings): CompressedAirDesignDetailsProperties {
    if (oldSettings.unitsOfMeasure == 'Metric' && newSettings.unitsOfMeasure == 'Imperial') {
      compressedAirDesignDetailsProperties.modulatingPressureRange = this.convertUnitsService.value(compressedAirDesignDetailsProperties.modulatingPressureRange).from('barg').to('psig');
      compressedAirDesignDetailsProperties.maxFullFlowPressure = this.convertUnitsService.value(compressedAirDesignDetailsProperties.maxFullFlowPressure).from('barg').to('psig');
      compressedAirDesignDetailsProperties.inputPressure = this.convertUnitsService.value(compressedAirDesignDetailsProperties.inputPressure).from('bara').to('psia');

    } else if (oldSettings.unitsOfMeasure == 'Imperial' && newSettings.unitsOfMeasure == 'Metric') {
      compressedAirDesignDetailsProperties.modulatingPressureRange = this.convertUnitsService.value(compressedAirDesignDetailsProperties.modulatingPressureRange).from('psig').to('barg');
      compressedAirDesignDetailsProperties.maxFullFlowPressure = this.convertUnitsService.value(compressedAirDesignDetailsProperties.maxFullFlowPressure).from('psig').to('barg');
      compressedAirDesignDetailsProperties.inputPressure = this.convertUnitsService.value(compressedAirDesignDetailsProperties.inputPressure).from('psia').to('bara');
    }
    compressedAirDesignDetailsProperties.modulatingPressureRange = this.convertUnitsService.roundVal(compressedAirDesignDetailsProperties.modulatingPressureRange, 2);
    compressedAirDesignDetailsProperties.maxFullFlowPressure = this.convertUnitsService.roundVal(compressedAirDesignDetailsProperties.maxFullFlowPressure, 2);
    compressedAirDesignDetailsProperties.inputPressure = this.convertUnitsService.roundVal(compressedAirDesignDetailsProperties.inputPressure, 2);

    return compressedAirDesignDetailsProperties;
  }

  convertCompressedAirControlsProperties(compressedAirControlsProperties: CompressedAirControlsProperties, oldSettings: Settings, newSettings: Settings): CompressedAirControlsProperties {
    if (oldSettings.unitsOfMeasure == 'Metric' && newSettings.unitsOfMeasure == 'Imperial') {
      compressedAirControlsProperties.unloadSumpPressure = this.convertUnitsService.value(compressedAirControlsProperties.unloadSumpPressure).from('barg').to('psig');
    } else if (oldSettings.unitsOfMeasure == 'Imperial' && newSettings.unitsOfMeasure == 'Metric') {
      compressedAirControlsProperties.unloadSumpPressure = this.convertUnitsService.value(compressedAirControlsProperties.unloadSumpPressure).from('psig').to('barg');
    }
    compressedAirControlsProperties.unloadSumpPressure = this.convertUnitsService.roundVal(compressedAirControlsProperties.unloadSumpPressure, 2);
    return compressedAirControlsProperties;
  }

  convertCompressedAirMotor(compressedAirMotor: CompressedAirMotorProperties, oldSettings: Settings, newSettings: Settings): CompressedAirMotorProperties {
    if (oldSettings.unitsOfMeasure == 'Metric' && newSettings.unitsOfMeasure == 'Imperial') {
      compressedAirMotor.motorPower = this.convertUnitsService.value(compressedAirMotor.motorPower).from('kW').to('hp');

    } else if (oldSettings.unitsOfMeasure == 'Imperial' && newSettings.unitsOfMeasure == 'Metric') {
      compressedAirMotor.motorPower = this.convertUnitsService.value(compressedAirMotor.motorPower).from('hp').to('kW');
    }
    compressedAirMotor.motorPower = this.convertUnitsService.roundVal(compressedAirMotor.motorPower, 2);

    return compressedAirMotor;
  }

  convertNameplateData(namePlateData: NameplateData, oldSettings: Settings, newSettings: Settings): NameplateData {
    if (oldSettings.unitsOfMeasure == 'Metric' && newSettings.unitsOfMeasure == 'Imperial') {
      namePlateData.fullLoadOperatingPressure = this.convertUnitsService.value(namePlateData.fullLoadOperatingPressure).from('barg').to('psig');
      namePlateData.fullLoadRatedCapacity = this.convertUnitsService.value(namePlateData.fullLoadRatedCapacity).from('m3/min').to('ft3/min');

    } else if (oldSettings.unitsOfMeasure == 'Imperial' && newSettings.unitsOfMeasure == 'Metric') {
      namePlateData.fullLoadOperatingPressure = this.convertUnitsService.value(namePlateData.fullLoadOperatingPressure).from('psig').to('barg');
      namePlateData.fullLoadRatedCapacity = this.convertUnitsService.value(namePlateData.fullLoadRatedCapacity).from('ft3/min').to('m3/min');
    }
    namePlateData.fullLoadOperatingPressure = this.convertUnitsService.roundVal(namePlateData.fullLoadOperatingPressure, 2);
    namePlateData.fullLoadRatedCapacity = this.convertUnitsService.roundVal(namePlateData.fullLoadRatedCapacity, 2);

    return namePlateData;
  }

}
