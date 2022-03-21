import { Injectable } from '@angular/core';
import { SSMT } from '../../../shared/models/steam/ssmt';
import { SSMTLosses } from '../../../shared/models/steam/steam-outputs';
import { WaterfallInput, WaterfallItem } from '../../../shared/models/plotting';

@Injectable()
export class ReportGraphsService {


  constructor() { }

  getProcessUsageValuesAndLabels(ssmt: SSMT): Array<{ value: number, label: string }> {
    let processUsageData = new Array<{ value: number, label: string }>();
    if (ssmt.outputData) {
      if (ssmt.outputData.highPressureProcessSteamUsage.processUsage) {
        processUsageData.push({ value: ssmt.outputData.highPressureProcessSteamUsage.processUsage, label: 'HP' });
      }
      if (ssmt.outputData.mediumPressureProcessSteamUsage.processUsage) {
        processUsageData.push({ value: ssmt.outputData.mediumPressureProcessSteamUsage.processUsage, label: 'MP' });
      }
      if (ssmt.outputData.lowPressureProcessSteamUsage.processUsage) {
        processUsageData.push({ value: ssmt.outputData.lowPressureProcessSteamUsage.processUsage, label: 'LP' });
      }
    }
    return processUsageData;
  }

  getGenerationValuesAndLabels(ssmt: SSMT): Array<{ value: number, label: string }> {
    let valuesAndLabels = new Array<{ value: number, label: string }>();
    if (ssmt.turbineInput) {
      if (ssmt.turbineInput.condensingTurbine.useTurbine) {
        valuesAndLabels.push({ value: ssmt.outputData.condensingTurbine.powerOut, label: 'Condensing' });
      }
      if (ssmt.turbineInput.highToLowTurbine.useTurbine) {
        valuesAndLabels.push({ value: ssmt.outputData.highPressureToLowPressureTurbine.powerOut, label: 'HP to LP' });
      }
      if (ssmt.turbineInput.highToMediumTurbine.useTurbine) {
        valuesAndLabels.push({ value: ssmt.outputData.highPressureToMediumPressureTurbine.powerOut, label: 'HP to MP' });
      }
      if (ssmt.turbineInput.mediumToLowTurbine.useTurbine) {
        valuesAndLabels.push({ value: ssmt.outputData.mediumPressureToLowPressureTurbine.powerOut, label: 'MP to LP' });
      }
    }
    return valuesAndLabels;
  }

  getWaterfallData(selectedSsmt: { name: string, ssmt: SSMT, index: number }, units: string, startColor: string, lossColor: string, netColor: string, baselineLosses: SSMTLosses, modificationLosses: SSMTLosses) {
    let tmpLosses: SSMTLosses;
    if (selectedSsmt.index == 0) {
      tmpLosses = baselineLosses;
    }
    else if (modificationLosses !== undefined && modificationLosses !== null) {
      tmpLosses = modificationLosses;
    }
    else {
      throw "ERROR - Invalid index supplied for waterfall loss data array.";
    }
    let inputObjects: Array<WaterfallItem> = new Array<WaterfallItem>();
    let startNode: WaterfallItem = {
      value: tmpLosses.fuelEnergy + tmpLosses.makeupWaterEnergy,
      label: 'Input Energy',
      isStartValue: true,
      isNetValue: false
    }
    let processUseNetNode: WaterfallItem = {
      value: tmpLosses.allProcessUsageUsefulEnergy,
      label: 'Process Use',
      isStartValue: false,
      isNetValue: true
    };
    let turbineUseNetNode: WaterfallItem = {
      value: tmpLosses.highToLowTurbineUsefulEnergy + tmpLosses.highToMediumTurbineUsefulEnergy + tmpLosses.mediumToLowTurbineUsefulEnergy + tmpLosses.condensingTurbineUsefulEnergy,
      label: 'Turbine Generation',
      isStartValue: false,
      isNetValue: true
    }
    let otherLossNode: WaterfallItem = {
      value: tmpLosses.blowdown + tmpLosses.highPressureHeader + tmpLosses.mediumPressureHeader + tmpLosses.lowPressureHeader + tmpLosses.condensateLosses + tmpLosses.deaeratorVentLoss + tmpLosses.lowPressureVentLoss + tmpLosses.condensateFlashTankLoss,
      label: 'Other Losses',
      isStartValue: false,
      isNetValue: false
    };
    let stackLossNode: WaterfallItem = {
      value: tmpLosses.stack,
      label: 'Stack Losses',
      isStartValue: false,
      isNetValue: false
    };
    let turbineLossNode: WaterfallItem = {
      value: tmpLosses.highToLowTurbineEfficiencyLoss + tmpLosses.highToMediumTurbineEfficiencyLoss + tmpLosses.mediumToLowTurbineEfficiencyLoss + tmpLosses.condensingTurbineEfficiencyLoss + tmpLosses.condensingLosses,
      label: 'Turbine Losses',
      isStartValue: false,
      isNetValue: false
    };
    let condensateLossNode: WaterfallItem = {
      value: tmpLosses.highPressureProcessLoss + tmpLosses.mediumPressureProcessLoss + tmpLosses.lowPressureProcessLoss,
      label: 'Unreturned Condensate',
      isStartValue: false,
      isNetValue: false
    };
    inputObjects = [startNode, turbineUseNetNode, turbineLossNode, processUseNetNode, condensateLossNode, stackLossNode, otherLossNode];

    let waterfallData: WaterfallInput = {
      name: selectedSsmt.name,
      inputObjects: inputObjects,
      units: units,
      startColor: startColor,
      lossColor: lossColor,
      netColor: netColor
    };
    return waterfallData;
  }


  getWaterfallLabelsAndValues(losses: SSMTLosses): Array<{ value: number, label: string, stackTraceValue: number, color: string }> {
    let labelsAndValues: Array<{ value: number, label: string, stackTraceValue: number, color: string }> = new Array();
    let stackTraceValue: number = 0;
    let inputEnergy: number = losses.fuelEnergy + losses.makeupWaterEnergy;
    //input energy
    labelsAndValues.push({
      value: inputEnergy,
      label: 'Input Energy',
      stackTraceValue: stackTraceValue,
      color: '#229954'
    });
    //process use
    let processUse: number = losses.allProcessUsageUsefulEnergy;
    stackTraceValue = inputEnergy - processUse;
    labelsAndValues.push({
      value: processUse,
      label: 'Process Use',
      stackTraceValue: stackTraceValue,
      color: '#E67E22'
    });
    //turbine generation
    let turbineGeneration: number = losses.highToLowTurbineUsefulEnergy + losses.highToMediumTurbineUsefulEnergy + losses.mediumToLowTurbineUsefulEnergy + losses.condensingTurbineUsefulEnergy;
    stackTraceValue = stackTraceValue - turbineGeneration;
    labelsAndValues.push({
      value: turbineGeneration,
      label: 'Turbine Generation',
      stackTraceValue: stackTraceValue,
      color: '#E67E22'
    });
    //turbine losses
    let turbineLosses: number = losses.highToLowTurbineEfficiencyLoss + losses.highToMediumTurbineEfficiencyLoss + losses.mediumToLowTurbineEfficiencyLoss + losses.condensingTurbineEfficiencyLoss + losses.condensingLosses;
    stackTraceValue = stackTraceValue - turbineLosses;
    labelsAndValues.push({
      value: turbineLosses,
      label: 'Turbine Losses',
      stackTraceValue: stackTraceValue,
      color: '#E74C3C'
    });
    //unreturned condensate
    let unreturnedCondensate: number = losses.highPressureProcessLoss + losses.mediumPressureProcessLoss + losses.lowPressureProcessLoss;
    stackTraceValue = stackTraceValue - unreturnedCondensate;
    labelsAndValues.push({
      value: unreturnedCondensate,
      label: 'Unreturned Condensate',
      stackTraceValue: stackTraceValue,
      color: '#E74C3C'
    });
    //stack losses
    let stackLoss: number = losses.stack;
    stackTraceValue = stackTraceValue - stackLoss;
    labelsAndValues.push({
      value: stackLoss,
      label: 'Stack Losses',
      stackTraceValue: stackTraceValue,
      color: '#E74C3C'
    });
    //other losses
    let otherLosses: number = losses.blowdown + losses.highPressureHeader + losses.mediumPressureHeader + losses.lowPressureHeader + losses.condensateLosses + losses.deaeratorVentLoss + losses.lowPressureVentLoss + losses.condensateFlashTankLoss;
    stackTraceValue = stackTraceValue - otherLosses;
    labelsAndValues.push({
      value: otherLosses,
      label: 'Other Losses',
      stackTraceValue: stackTraceValue,
      color: '#E74C3C'
    });
    return labelsAndValues.reverse();
  }
}
