import { Injectable } from '@angular/core';
import { ConvertUnitsService } from '../../../shared/convert-units/convert-units.service';
import { Settings } from '../../../shared/models/settings';
import { SystemAndEquipmentCurveService, PumpSystemCurveData, FanSystemCurveData } from '../system-and-equipment-curve.service';
import * as _ from 'lodash';
import { RegressionEquationsService } from '../regression-equations/regression-equations.service';
import { BehaviorSubject } from 'rxjs';
@Injectable()
export class SystemAndEquipmentCurveGraphService {

  selectedDataPoint: BehaviorSubject<Array<{ x: number, y: number, fluidPower?: number }>>;
  baselineIntersectionPoint: BehaviorSubject<{ x: number, y: number, fluidPower: number }>;
  modificationIntersectionPoint: BehaviorSubject<{ x: number, y: number, fluidPower: number }>;
  clearDataPoints: BehaviorSubject<boolean>;
  xRef: any;
  yRef: any;
  constructor(private convertUnitsService: ConvertUnitsService, private systemAndEquipmentCurveService: SystemAndEquipmentCurveService, private regressionEquationsService: RegressionEquationsService) {
    this.selectedDataPoint = new BehaviorSubject(undefined);
    this.baselineIntersectionPoint = new BehaviorSubject(undefined);
    this.modificationIntersectionPoint = new BehaviorSubject(undefined);
    this.clearDataPoints = new BehaviorSubject<boolean>(false);
  }

  initColumnTitles(settings: Settings, equipmentType: string, displayEquipmentCurve: boolean, displayModificationCurve: boolean, displaySystemCurve: boolean): Array<string> {
    let columnTitles: Array<string> = new Array<string>();
    let flowMeasurement: string;
    let distanceMeasurement: string;
    let equipmentLabel: string;
    let powerMeasurement: string;
    if (equipmentType == 'fan') {
      flowMeasurement = this.getDisplayUnit(settings.fanFlowRate);
      distanceMeasurement = this.getDisplayUnit(settings.fanPressureMeasurement);
      powerMeasurement = this.getDisplayUnit(settings.fanPowerMeasurement);
      equipmentLabel = 'Pressure';
    } else if (equipmentType == 'pump') {
      flowMeasurement = this.getDisplayUnit(settings.flowMeasurement);
      distanceMeasurement = this.getDisplayUnit(settings.distanceMeasurement);
      powerMeasurement = this.getDisplayUnit(settings.powerMeasurement);
      equipmentLabel = 'Head'
    }
    if (displayEquipmentCurve) {
      columnTitles = ['Flow Rate (' + flowMeasurement + ')', 'Base ' + equipmentLabel + ' (' + distanceMeasurement + ')'];
      if (displayModificationCurve) {
        columnTitles.push('Mod ' + equipmentLabel + ' (' + distanceMeasurement + ')');
      }
    }
    if (displaySystemCurve) {
      if (!displayEquipmentCurve) {
        columnTitles.push('Flow Rate (' + flowMeasurement + ')');
      }
      columnTitles.push('System ' + equipmentLabel + ' (' + distanceMeasurement + ')');
      columnTitles.push('Fluid Power (' + powerMeasurement + ')');
    }
    return columnTitles;
  }

  getDisplayUnit(unit: string) {
    if (unit) {
      let dispUnit: string = this.convertUnitsService.getUnit(unit).unit.name.display;
      dispUnit = dispUnit.replace('(', '');
      dispUnit = dispUnit.replace(')', '');
      return dispUnit;
    }
  }

  getGraphDomainAndRange(
    isEquipmentCurveShown: boolean,
    isSystemCurveShown: boolean,
    equipmentType: string,
    width: number,
    height: number,
    baselineEquipmentData: Array<{ x: number, y: number }>,
    modificationEqupmentData: Array<{ x: number, y: number }>,
    pumpSystemCurveData: PumpSystemCurveData,
    fanSystemCurveData: FanSystemCurveData
  ): {
    xDomain: { min: number, max: number },
    xRange: { min: number, max: number },
    yDomain: { min: number, max: number },
    yRange: { min: number, max: number }
  } {
    let maxX: { x: number, y: number } = { x: 0, y: 0 };
    let maxY: { x: number, y: number } = { x: 0, y: 0 };

    if (isEquipmentCurveShown == true && baselineEquipmentData && modificationEqupmentData) {
      let baselineEquipmentDataCopy: Array<{ x: number, y: number }> = JSON.parse(JSON.stringify(baselineEquipmentData));
      let modificationEqupmentDataCopy: Array<{ x: number, y: number }> = JSON.parse(JSON.stringify(modificationEqupmentData));
      let combinedData: Array<{ x: number, y: number }> = modificationEqupmentDataCopy.concat(baselineEquipmentDataCopy);
      maxX = _.maxBy(combinedData, (data) => { return data.x });
      maxY = _.maxBy(combinedData, (data) => { return data.y });
    }

    if (isSystemCurveShown == true) {
      if (equipmentType == 'pump' && pumpSystemCurveData) {
        if (pumpSystemCurveData != undefined) {
          let pumpSystemDataCpy: PumpSystemCurveData = JSON.parse(JSON.stringify(pumpSystemCurveData));
          let maxXValue: number = _.max([maxX.x, pumpSystemDataCpy.pointOneFlowRate, pumpSystemDataCpy.pointTwoFlowRate]);
          maxX.x = maxXValue;
          let maxYValue: number = _.max([maxY.y, pumpSystemDataCpy.pointOneHead, pumpSystemDataCpy.pointTwoHead]);
          maxY.y = maxYValue;
        }
      } else if (equipmentType == 'fan') {
        if (fanSystemCurveData != undefined && fanSystemCurveData) {
          let fanSystemCurveDataCpy: FanSystemCurveData = JSON.parse(JSON.stringify(fanSystemCurveData));
          let maxXValue: number = _.max([maxX.x, fanSystemCurveDataCpy.pointOneFlowRate, fanSystemCurveDataCpy.pointTwoFlowRate]);
          maxX.x = maxXValue;
          let maxYValue: number = _.max([maxY.y, fanSystemCurveDataCpy.pointOnePressure, fanSystemCurveDataCpy.pointTwoPressure]);
          maxY.y = maxYValue;
        }
      }
    }

    if (maxX.x < 50) {
      maxX.x = 50;
    }

    if (maxY.y < 50) {
      maxY.y = 50;
    }

    let paddingX = maxX.x * 0.1;
    let paddingY = maxY.y * 0.1;
    //create x and y graph scales
    let xRange: { min: number, max: number } = { min: 0, max: width };
    let xDomain = { min: 0, max: maxX.x + paddingX };
    let yRange: { min: number, max: number } = { min: height, max: 0 };
    let yDomain = { min: 0, max: maxY.y + paddingY };
    return { xDomain: xDomain, yDomain: yDomain, xRange: xRange, yRange: yRange }
  }


  getIntersectionPoint(equipmentType: string, settings: Settings, curveDataPairs: Array<{ x: number, y: number }>, systemCurveRegressionData: Array<{ x: number, y: number, fluidPower: number }>) {
    let yIntersectionPoint: number = this.calculateIntersectionPoint(systemCurveRegressionData, curveDataPairs);
    if (yIntersectionPoint != undefined) {
      let staticVal: number;
      let coefficient: number;
      let systemLossExponent: number;
      let fluidPowerCalcVal: number;
      if (equipmentType == 'fan') {
        let fanSystemCurveData: FanSystemCurveData = this.systemAndEquipmentCurveService.fanSystemCurveData.getValue();
        coefficient = this.regressionEquationsService.calculateLossCoefficient(
          fanSystemCurveData.pointOneFlowRate,
          fanSystemCurveData.pointOnePressure,
          fanSystemCurveData.pointTwoFlowRate,
          fanSystemCurveData.pointTwoPressure,
          fanSystemCurveData.systemLossExponent
        );
        staticVal = this.regressionEquationsService.calculateStaticHead(
          fanSystemCurveData.pointOneFlowRate,
          fanSystemCurveData.pointOnePressure,
          fanSystemCurveData.pointTwoFlowRate,
          fanSystemCurveData.pointTwoPressure,
          fanSystemCurveData.systemLossExponent
        );
        systemLossExponent = fanSystemCurveData.systemLossExponent;
        fluidPowerCalcVal = fanSystemCurveData.compressibilityFactor;
      } else if (equipmentType == 'pump') {
        let pumpSystemCurveData: PumpSystemCurveData = this.systemAndEquipmentCurveService.pumpSystemCurveData.getValue();
        coefficient = this.regressionEquationsService.calculateLossCoefficient(
          pumpSystemCurveData.pointOneFlowRate,
          pumpSystemCurveData.pointOneHead,
          pumpSystemCurveData.pointTwoFlowRate,
          pumpSystemCurveData.pointTwoHead,
          pumpSystemCurveData.systemLossExponent
        );
        staticVal = this.regressionEquationsService.calculateStaticHead(
          pumpSystemCurveData.pointOneFlowRate,
          pumpSystemCurveData.pointOneHead,
          pumpSystemCurveData.pointTwoFlowRate,
          pumpSystemCurveData.pointTwoHead,
          pumpSystemCurveData.systemLossExponent
        );
        systemLossExponent = pumpSystemCurveData.systemLossExponent;
        fluidPowerCalcVal = pumpSystemCurveData.specificGravity;
      }
      let calculatedFlowFromYIntersection: number = this.calculateXValFromY(yIntersectionPoint, staticVal, coefficient, systemLossExponent);
      let fluidPower: number;
      if (equipmentType == 'pump') {
        fluidPower = this.regressionEquationsService.getPumpFluidPower(yIntersectionPoint, calculatedFlowFromYIntersection, fluidPowerCalcVal, settings);
      } else if (equipmentType == 'fan') {
        fluidPower = this.regressionEquationsService.getFanFluidPower(yIntersectionPoint, calculatedFlowFromYIntersection, fluidPowerCalcVal, settings);
      }
      return {
        x: calculatedFlowFromYIntersection,
        y: yIntersectionPoint,
        fluidPower: fluidPower
      };
    } else {
      return undefined;
    }
  }

  calculateIntersectionPoint(
    systemCurve: Array<{ x: number, y: number, fluidPower: number }>,
    equipmentCurve: Array<{ x: number, y: number }>
  ): number {
    let intersected: boolean = false;
    let equipmentStartGreater: boolean = false;
    let intersectPoint: number = 0;
    if (equipmentCurve[0].y > systemCurve[0].y) {
      equipmentStartGreater = true;
    }
    let iterateMax: number;
    if(systemCurve.length <= equipmentCurve.length){
      iterateMax = systemCurve.length;
    }else{
      iterateMax = equipmentCurve.length;
    }
    if (equipmentStartGreater) {
      for (let i = 1; i < iterateMax; i++) {
        if (equipmentCurve[i].y < systemCurve[i].y) {
          intersectPoint = i;
          intersected = true;
          break;
        }
      };
    }
    else {
      for (let i = 1; i < iterateMax; i++) {
        if (equipmentCurve[i].y > systemCurve[i].y) {
          intersectPoint = i;
          intersected = true;
          break;
        }
      };
    }

    if (intersected) {
      let equipmentYVal1 = equipmentCurve[intersectPoint - 1].y;
      let equipmentYVal2 = equipmentCurve[intersectPoint].y;
      let systemYVal1 = systemCurve[intersectPoint - 1].y;
      let systemYVal2 = systemCurve[intersectPoint].y;
      let avgYVal = (equipmentYVal1 + equipmentYVal2 + systemYVal1 + systemYVal2) / 4;
      return avgYVal;
    } else {
      return undefined;
    }
  }

  calculateXValFromY(yVal: number, staticVal: number, coefficient: number, systemLossExponent: number) {
    return Math.pow((yVal - staticVal) / coefficient, 1 / systemLossExponent);
  }

  initTooltipData(settings: Settings, equipmentType: string, isEquipmentCurveShown: boolean, isEquipmentModificationShown: boolean, isSystemCurveShown: boolean): Array<{ label: string, value: number, unit: string, formatX: boolean }> {
    let tooltipData = new Array<{ label: string, value: number, unit: string, formatX: boolean }>();
    let flowMeasurement: string;
    let distanceMeasurement: string;
    let yValueLabel: string;
    let powerMeasurement: string;
    if (equipmentType == 'fan') {
      yValueLabel = "Pressure";
      distanceMeasurement = this.getDisplayUnit(settings.fanPressureMeasurement);
      flowMeasurement = this.getDisplayUnit(settings.fanFlowRate);
      powerMeasurement = settings.fanPowerMeasurement;
    } else {
      yValueLabel = "Head";
      distanceMeasurement = settings.distanceMeasurement;
      flowMeasurement = settings.flowMeasurement;
      powerMeasurement = settings.powerMeasurement;
    }

    if (isEquipmentCurveShown) {
      tooltipData.push({
        label: "Base Flow",
        value: null,
        unit: " " + flowMeasurement,
        formatX: true
      });
      if (isEquipmentModificationShown) {
        tooltipData.push({
          label: "Mod Flow",
          value: null,
          unit: " " + flowMeasurement,
          formatX: true
        });
      }
    }
    if (isSystemCurveShown) {
      tooltipData.push({
        label: "Sys. Flow",
        value: null,
        unit: " " + flowMeasurement,
        formatX: true
      });
    }

    if (isEquipmentCurveShown) {
      tooltipData.push({
        label: "Base " + yValueLabel,
        value: null,
        unit: " " + distanceMeasurement,
        formatX: false
      });
      if (isEquipmentModificationShown) {
        tooltipData.push({
          label: "Mod " + yValueLabel,
          value: null,
          unit: " " + distanceMeasurement,
          formatX: false
        });
      }
    }
    if (isSystemCurveShown) {
      tooltipData.push({
        label: "Sys. Curve " + yValueLabel,
        value: null,
        unit: " " + distanceMeasurement,
        formatX: false
      });
      tooltipData.push({
        label: "Fluid Power",
        value: null,
        unit: " " + powerMeasurement,
        formatX: null
      });
    }
    return tooltipData;
  }

}
