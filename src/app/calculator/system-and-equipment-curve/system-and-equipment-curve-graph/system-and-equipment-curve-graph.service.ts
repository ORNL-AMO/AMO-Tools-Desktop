import { Injectable, ElementRef } from '@angular/core';
import { ConvertUnitsService } from '../../../shared/convert-units/convert-units.service';
import { Settings } from '../../../shared/models/settings';
import { SystemAndEquipmentCurveService } from '../system-and-equipment-curve.service';
import * as _ from 'lodash';
import { RegressionEquationsService } from '../regression-equations.service';
import { BehaviorSubject } from 'rxjs';
import { SvgToPngService } from '../../../shared/helper-services/svg-to-png.service';
import { PumpSystemCurveData, FanSystemCurveData, EquipmentInputs } from '../../../shared/models/system-and-equipment-curve';
import { intersection } from 'lodash';
@Injectable()
export class SystemAndEquipmentCurveGraphService {

  selectedDataPoint: BehaviorSubject<Array<{ x: number, y: number, fluidPower?: number }>>;
  baselineIntersectionPoint: BehaviorSubject<{ x: number, y: number, fluidPower: number }>;
  modificationIntersectionPoint: BehaviorSubject<{ x: number, y: number, fluidPower: number }>;
  clearDataPoints: BehaviorSubject<boolean>;
  xRef: any;
  yRef: any;
  svg: any;
  constructor(private convertUnitsService: ConvertUnitsService, private systemAndEquipmentCurveService: SystemAndEquipmentCurveService, private regressionEquationsService: RegressionEquationsService, private svgToPngService: SvgToPngService) {
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
    fanSystemCurveData: FanSystemCurveData,
    maxFlowRate: number
  ): {
    xDomain: { min: number, max: number },
    xRange: { min: number, max: number },
    yDomain: { min: number, max: number },
    yRange: { min: number, max: number }
  } {
    let maxY: number = 0;

    if (isEquipmentCurveShown == true && baselineEquipmentData && modificationEqupmentData) {
      let baselineEquipmentDataCopy: Array<{ x: number, y: number }> = JSON.parse(JSON.stringify(baselineEquipmentData));
      let modificationEqupmentDataCopy: Array<{ x: number, y: number }> = JSON.parse(JSON.stringify(modificationEqupmentData));
      let combinedData: Array<{ x: number, y: number }> = modificationEqupmentDataCopy.concat(baselineEquipmentDataCopy);
      // let tmpMaxX = _.maxBy(combinedData, (data) => { return data.x });
      // if (tmpMaxX != undefined) { maxX = tmpMaxX };
      let tmpMaxY = _.maxBy(combinedData, (data) => { return data.y });
      if (tmpMaxY != undefined) { maxY = tmpMaxY.y };
    }

    if (isSystemCurveShown == true) {
      if (equipmentType == 'pump' && pumpSystemCurveData) {
        if (pumpSystemCurveData != undefined) {
          let pumpSystemDataCpy: PumpSystemCurveData = JSON.parse(JSON.stringify(pumpSystemCurveData));
          // let maxXValue: number = _.max([maxX.x, pumpSystemDataCpy.pointOneFlowRate, pumpSystemDataCpy.pointTwoFlowRate]);
          // maxX.x = maxXValue;
          let maxYValue: number = _.max([maxY, pumpSystemDataCpy.pointOneHead, pumpSystemDataCpy.pointTwoHead]);
          maxY = maxYValue;
        }
      } else if (equipmentType == 'fan') {
        if (fanSystemCurveData != undefined && fanSystemCurveData) {
          let fanSystemCurveDataCpy: FanSystemCurveData = JSON.parse(JSON.stringify(fanSystemCurveData));
          // let maxXValue: number = _.max([maxX.x, fanSystemCurveDataCpy.pointOneFlowRate, fanSystemCurveDataCpy.pointTwoFlowRate]);
          // maxX.x = maxXValue;
          let maxYValue: number = _.max([maxY, fanSystemCurveDataCpy.pointOnePressure, fanSystemCurveDataCpy.pointTwoPressure]);
          maxY = maxYValue;
        }
      }
    }

    if (maxY < 50) {
      maxY = 50;
    }

    let paddingX = maxFlowRate * 0.1;
    let paddingY = maxY * 0.1;
    //create x and y graph scales
    let xRange: { min: number, max: number } = { min: 0, max: width };
    let xDomain = { min: 0, max: maxFlowRate + paddingX };
    let yRange: { min: number, max: number } = { min: height, max: 0 };
    let yDomain = { min: 0, max: maxY + paddingY };
    return { xDomain: xDomain, yDomain: yDomain, xRange: xRange, yRange: yRange }
  }

  getIntersectionPoint(equipmentType: string, settings: Settings, curveDataPairs: Array<{ x: number, y: number }>) {
    let intersectionPoint = this.systemAndEquipmentCurveService.systemCurveIntersectionData.getValue();
    if (!intersectionPoint) {
      intersectionPoint = {
        baseline: {x: 0, y: 0},
        modification: undefined
      };
      intersectionPoint.baseline = this.systemAndEquipmentCurveService.calculateBaselineIntersectionPoint(curveDataPairs);
    }

    let fluidPower: number = this.getFluidPowerFromIntersectionPoint(intersectionPoint.baseline.x, intersectionPoint.baseline.y, settings, equipmentType);
    return {
      x: intersectionPoint.baseline.x,
      y: intersectionPoint.baseline.y,
      fluidPower: fluidPower
    };
  }

  getModifiedIntersectionPoint(equipmentType: string, settings: Settings, curveDataPairs: Array<{ x: number, y: number }>): { x: number, y: number, fluidPower: number } {
    let intersectionPoint = this.systemAndEquipmentCurveService.systemCurveIntersectionData.getValue();
    if (intersectionPoint && intersectionPoint.modification) {
      let fluidPower: number = this.getFluidPowerFromIntersectionPoint(intersectionPoint.modification.x, intersectionPoint.modification.y, settings, equipmentType);
      debugger;
      return { x: intersectionPoint.modification.x, y: intersectionPoint.modification.y, fluidPower: fluidPower };
    } else {
      return undefined;
    }
  }

  getFluidPowerFromIntersectionPoint(x: number, y: number, settings: Settings, equipmentType: string): number {
    let fluidPowerCalcVal: number;
    if (equipmentType == 'fan') {
      let fanSystemCurveData: FanSystemCurveData = this.systemAndEquipmentCurveService.fanSystemCurveData.getValue();
      fluidPowerCalcVal = fanSystemCurveData.compressibilityFactor;
    } else if (equipmentType == 'pump') {
      let pumpSystemCurveData: PumpSystemCurveData = this.systemAndEquipmentCurveService.pumpSystemCurveData.getValue();
      fluidPowerCalcVal = pumpSystemCurveData.specificGravity;
    }
    let fluidPower: number;
    if (equipmentType == 'pump') {
      fluidPower = this.regressionEquationsService.getPumpFluidPower(y, x, fluidPowerCalcVal, settings);
    } else if (equipmentType == 'fan') {
      fluidPower = this.regressionEquationsService.getFanFluidPower(y, x, fluidPowerCalcVal, settings);
    }
    return fluidPower;
  }
  
  // calculateXValFromY(yVal: number, staticVal: number, coefficient: number, systemLossExponent: number) {
  //   return Math.pow((yVal - staticVal) / coefficient, 1 / systemLossExponent);
  // }

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

  downloadChart(ngChart: ElementRef, equipmentType: string) {
    let exportName: string = this.getExportName(equipmentType);
    this.svgToPngService.exportPNG(ngChart, exportName);
  }

  getExportName(equipmentType: string): string {
    let exportName: string;
    let isSystemCurveShown: boolean = this.systemAndEquipmentCurveService.systemCurveCollapsed.getValue() == 'open';
    let isEquipmentCurveShown: boolean = this.systemAndEquipmentCurveService.equipmentCurveCollapsed.getValue() == 'open';
    if (isSystemCurveShown) {
      exportName = equipmentType + '-system-curve-graph';
    } else if (isEquipmentCurveShown) {
      exportName = equipmentType + '-curve-graph';
    }
    return exportName;
  }
}
