import { Injectable } from '@angular/core';
import { SSMT } from '../../../shared/models/steam/ssmt';
import { Settings } from '../../../shared/models/settings';
import * as d3 from 'd3';

@Injectable()
export class ReportGraphsService {
  
  // number formatter for d3
  format: any = d3.format(',.2f');
  
  constructor() { }

  getProcessUsageData(ssmt: SSMT): Array<number> {
    let processUsageData = new Array<number>();
    if (ssmt.headerInput) {
      if (ssmt.headerInput.highPressure) {
        processUsageData.push(ssmt.headerInput.highPressure.processSteamUsage);
      }
      if (ssmt.headerInput.mediumPressure) {
        processUsageData.push(ssmt.headerInput.mediumPressure.processSteamUsage);
      }
      if (ssmt.headerInput.lowPressure) {
        processUsageData.push(ssmt.headerInput.lowPressure.processSteamUsage);
      }
    }
    else {
      processUsageData = [0, 0, 0];
    }
    return processUsageData;
  }

  getProcessUsageLabels(processUsageData: Array<number>, settings: Settings) {
    let l = processUsageData.length;
    let processUsageLabels = new Array<string>();
    if (l === 1) {
      processUsageLabels.push('HP: ' + this.format(processUsageData[0]) + ' ' + settings.steamEnergyMeasurement + '/hr');
    }
    else if (l === 2) {
      processUsageLabels.push('HP: ' + this.format(processUsageData[0]) + ' ' + settings.steamEnergyMeasurement + '/hr');
      processUsageLabels.push('LP: ' + this.format(processUsageData[1]) + ' ' + settings.steamEnergyMeasurement + '/hr');
    }
    else if (l === 3) {
      processUsageLabels.push('HP: ' + this.format(processUsageData[0]) + ' ' + settings.steamEnergyMeasurement + '/hr');
      processUsageLabels.push('MP: ' + this.format(processUsageData[1]) + ' ' + settings.steamEnergyMeasurement + '/hr');
      processUsageLabels.push('LP: ' + this.format(processUsageData[2]) + ' ' + settings.steamEnergyMeasurement + '/hr');
    }
    return processUsageLabels;
  }

  getGenerationData(ssmt: SSMT): Array<number> {
    let generationData = new Array<number>();
    if (ssmt.turbineInput) {
      if (ssmt.turbineInput.condensingTurbine.useTurbine) {
        generationData.push(ssmt.outputData.condensingTurbine.powerOut);
      }
      if (ssmt.turbineInput.highToLowTurbine.useTurbine) {
        generationData.push(ssmt.outputData.highToLowPressureTurbine.powerOut);
      }
      if (ssmt.turbineInput.highToMediumTurbine.useTurbine) {
        generationData.push(ssmt.outputData.highPressureToMediumPressureTurbine.powerOut);
      }
      if (ssmt.turbineInput.mediumToLowTurbine.useTurbine) {
        generationData.push(ssmt.outputData.mediumToLowPressureTurbine.powerOut);
      }
    }
    else {
      generationData = [0, 0, 0, 0];
    }
    return generationData;
  }

  getGenerationLabels(generationData: Array<number>, ssmt: SSMT, settings: Settings) {
    let l = generationData.length;
    let generationLabels = new Array<string>();
    let i = 0;
    if (ssmt.turbineInput.condensingTurbine.useTurbine) {
      generationLabels.push('Condensing Turbine: ' + this.format(generationData[i]) + ' ' + settings.steamPowerMeasurement);
      i++;
    }
    if (ssmt.turbineInput.highToLowTurbine.useTurbine) {
      generationLabels.push('HP to LP: ' + this.format(generationData[i]) + ' ' + settings.steamPowerMeasurement);
      i++;
    }
    if (ssmt.turbineInput.highToMediumTurbine.useTurbine) {
      generationLabels.push('HP to MP: ' + this.format(generationData[i]) + ' ' + settings.steamPowerMeasurement);
      i++;
    }
    if (ssmt.turbineInput.mediumToLowTurbine.useTurbine) {
      generationLabels.push('MP to LP: ' + this.format(generationData[i]) + ' ' + settings.steamPowerMeasurement);
    }
    return generationLabels;
  }
}
