import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Settings } from '../../shared/models/settings';
import { ByDataInputs, ByEquationInputs, EquipmentInputs, PumpSystemCurveData, FanSystemCurveData, ModificationEquipment } from '../../shared/models/system-and-equipment-curve';
import { CurveRegressionData, RawEquations, RegressionEquationsService } from './regression-equations.service';
import * as _ from 'lodash';
import * as jStat from 'jstat';
import * as nerdamer from 'nerdamer/all.min';
import { SystemCurveDataPoint } from './system-and-equipment-curve-graph/system-and-equipment-curve-graph.service';
import { ConvertUnitsService } from '../../shared/convert-units/convert-units.service';

@Injectable()
export class SystemAndEquipmentCurveService {
  //persistent data objects for calculator
  pumpByDataInputs: ByDataInputs;
  pumpByEquationInputs: ByEquationInputs;
  pumpEquipmentInputs: EquipmentInputs;
  fanByDataInputs: ByDataInputs;
  fanByEquationInputs: ByEquationInputs;
  fanEquipmentInputs: EquipmentInputs;

  //behavior subjects for calculator state
  currentField: BehaviorSubject<string>;
  focusedCalculator: BehaviorSubject<string>;
  selectedEquipmentCurveFormView: BehaviorSubject<string>;
  equipmentCurveCollapsed: BehaviorSubject<string>;
  systemCurveCollapsed: BehaviorSubject<string>;
  pumpModificationCollapsed: BehaviorSubject<string>;
  fanModificationCollapsed: BehaviorSubject<string>;
  updateGraph: BehaviorSubject<boolean>;

  //form data behavior subjects
  pumpSystemCurveData: BehaviorSubject<PumpSystemCurveData>;
  fanSystemCurveData: BehaviorSubject<FanSystemCurveData>;
  byDataInputs: BehaviorSubject<ByDataInputs>;
  equipmentInputs: BehaviorSubject<EquipmentInputs>;
  byEquationInputs: BehaviorSubject<ByEquationInputs>;

  //calcuated data points
  baselineEquipmentCurveDataPairs: Array<{ x: number, y: number }>;
  modifiedEquipmentCurveDataPairs: Array<{ x: number, y: number }>;
  systemCurveRegressionData: Array<{ x: number, y: number, fluidPower: number }>;
  baselinePowerDataPairs: Array<{ x: number, y: number }>;
  modificationPowerDataPairs: Array<{ x: number, y: number }>;

  //data points for system curve dropdown in assessment
  systemCurveIntersectionData: BehaviorSubject<IntersectionData>;
  modificationEquipment: BehaviorSubject<ModificationEquipment>;

  // Performance limits for data pair lengths
  medCoordinateLimit: number = 25000;
  highCoordinateLimit: number = 100000;
  existingInputUnits: string;

  constructor(private regressionEquationsService: RegressionEquationsService, private convertUnitsService: ConvertUnitsService) {
    this.currentField = new BehaviorSubject<string>('default');
    this.pumpSystemCurveData = new BehaviorSubject<PumpSystemCurveData>(undefined);
    this.fanSystemCurveData = new BehaviorSubject<FanSystemCurveData>(undefined);
    this.focusedCalculator = new BehaviorSubject<string>(undefined);
    this.byDataInputs = new BehaviorSubject<ByDataInputs>(undefined);
    this.equipmentInputs = new BehaviorSubject<EquipmentInputs>(undefined);
    this.byEquationInputs = new BehaviorSubject<ByEquationInputs>(undefined);
    this.selectedEquipmentCurveFormView = new BehaviorSubject<string>('Equation');
    this.equipmentCurveCollapsed = new BehaviorSubject<string>('closed');
    this.systemCurveCollapsed = new BehaviorSubject<string>('closed');
    this.pumpModificationCollapsed = new BehaviorSubject<string>('closed');
    this.fanModificationCollapsed = new BehaviorSubject<string>('closed');
    this.updateGraph = new BehaviorSubject<boolean>(false);
    this.systemCurveIntersectionData = new BehaviorSubject<IntersectionData>(undefined);
    this.modificationEquipment = new BehaviorSubject<ModificationEquipment>(undefined);
  }

  //calculation functions
  getMaxFlowRate(equipmentType: string): number {
    //50, system curve point (1,2) flow rate, byData max flow rate from data rows, byEquation max flow
    let maxFlowRate: number = 50;
    let maxEquipmentCurve: number = 0;
    let maxSystemCurve: number = 0;
    //max system curve
    if (this.systemCurveCollapsed.getValue() == 'open') {
      if (equipmentType == 'pump' && this.pumpSystemCurveData.getValue() != undefined) {
        maxSystemCurve = _.max([this.pumpSystemCurveData.getValue().pointOneFlowRate, this.pumpSystemCurveData.getValue().pointTwoFlowRate]);
      } else if (equipmentType == 'fan' && this.fanSystemCurveData.getValue() != undefined) {
        maxSystemCurve = _.max([this.fanSystemCurveData.getValue().pointOneFlowRate, this.fanSystemCurveData.getValue().pointTwoFlowRate]);
      }
    }
    //max equipment curve;
    if (this.equipmentCurveCollapsed.getValue() == 'open') {
      if (this.selectedEquipmentCurveFormView.getValue() == 'Equation' && this.byEquationInputs.getValue() != undefined) {
        maxEquipmentCurve = this.byEquationInputs.getValue().maxFlow;
      } else if (this.selectedEquipmentCurveFormView.getValue() == 'Data' && this.byDataInputs.getValue() != undefined) {
        maxEquipmentCurve = _.maxBy(this.byDataInputs.getValue().dataRows, (val) => { return val.flow }).flow;
      }

      if (this.equipmentInputs.getValue() != undefined
        && this.modificationEquipment.getValue() != undefined
        && this.equipmentInputs.getValue().baselineMeasurement > 0
        && (this.equipmentInputs.getValue().baselineMeasurement < this.modificationEquipment.getValue().speed)) {
          // todo 3998 investigate below - ignoring ratio
        // ratio creates infinite loop because baselineIntersect recalculation changes speed value every time
        // ratio = this.modificationEquipment.getValue().speed / this.equipmentInputs.getValue().baselineMeasurement;

        // Use spacing buffer instead
        let graphSpacing = this.modificationEquipment.getValue().flow * .25;
        maxFlowRate = this.modificationEquipment.getValue().flow + graphSpacing;
      }
    }

    // maxFlowRate = _.max([maxFlowRate, maxEquipmentCurve, maxSystemCurve]) * ratio;
    maxFlowRate = _.max([maxFlowRate, maxEquipmentCurve, maxSystemCurve]);
    return maxFlowRate;
  }

  resetModificationEquipment() {
    let modificationEquipment: ModificationEquipment = {
      head: 0,
      flow: 0,
      pressure: 0,
      speed: 0,
    };
    this.modificationEquipment.next(modificationEquipment);
  }

  calculatePumpEfficiency(baselinePowerDataPairs: Array<{ x: number, y: number }>, point: SystemCurveDataPoint, settings: Settings, isModification = false): SystemCurveDataPoint {
    let modificationEquipment = this.modificationEquipment.getValue();
    let equipmentInputs = this.equipmentInputs.getValue();
    let intersectionData = this.systemCurveIntersectionData.getValue();
    let systemCurveData = this.pumpSystemCurveData.getValue();
    // roundoff pointOperatingFlow offset to find match
    let pointOperatingFlow = 0;
    if (point.isUserPoint && !isModification) {
      pointOperatingFlow = Math.round(point.x / 10) * 10;
    } else if (intersectionData) {
      pointOperatingFlow = Math.round(intersectionData.baseline.x / 10) * 10;
    }
    let powerAtBaselineFlow = baselinePowerDataPairs.find(pair => {
      return pair.x == pointOperatingFlow;
    });

    if (powerAtBaselineFlow) {
      //Efficiency = ((Flow * Head)/3961.38)/Power
      point.power = powerAtBaselineFlow.y;
      if (isModification && modificationEquipment.speed > 0) {
        // Power|mod = Power|BL * (Speed|mod / Speed|BL) ^3
        point.power = powerAtBaselineFlow.y * Math.pow((modificationEquipment.speed / equipmentInputs.baselineMeasurement), 3);
      }
      //copy for conversions
      let pointCopy = JSON.parse(JSON.stringify(point));
      //flow = gpm
      let flow = this.convertUnitsService.value(pointCopy.x).from(settings.flowMeasurement).to('gpm');
      //head = ft
      let head = this.convertUnitsService.value(pointCopy.y).from(settings.distanceMeasurement).to('ft');
      //power = hp
      let hpPower = this.convertUnitsService.value(pointCopy.power).from(settings.powerMeasurement).to('hp');
      point.efficiency = (((flow * head * systemCurveData.specificGravity) / 3961.38) / hpPower) * 100;
    }
    return point;
  }

  calculateFanEfficiency(baselinePowerDataPairs: Array<{ x: number, y: number }>, point: SystemCurveDataPoint, settings: Settings, isModification = false): SystemCurveDataPoint {
    let equipmentInputs: EquipmentInputs = this.equipmentInputs.getValue();
    let modificationEquipment = this.modificationEquipment.getValue();
    let intersectionData = this.systemCurveIntersectionData.getValue();
    let systemCurveData = this.fanSystemCurveData.getValue();
    if (intersectionData && intersectionData.baseline && baselinePowerDataPairs.length > 0) {
      let pointOperatingFlow: number;
      if (point.isUserPoint && !isModification) {
        pointOperatingFlow = Math.round(point.x / 10) * 10;
      } else {
        pointOperatingFlow = Math.round(intersectionData.baseline.x / 10) * 10;
      }
      let smallestDiff = baselinePowerDataPairs[baselinePowerDataPairs.length - 1].x;
      let closestPowerVal;

      // Approximate closest x value (off less than a 10th/100th of a percent)
      for (let i = 0; i < baselinePowerDataPairs.length; i++) {
        let current = Math.abs(pointOperatingFlow - baselinePowerDataPairs[i].x);
        if (current < smallestDiff) {
          smallestDiff = current;
          closestPowerVal = baselinePowerDataPairs[i].y;
        }
      }
      if (closestPowerVal) {
        //Efficiency = ((Flow * Pressure)/6362)/Power
        // Power|mod = Power|BL * (Speed|mod / Speed|BL) ^3
        point.power = closestPowerVal;
        if (isModification && modificationEquipment.speed > 0) {
          // Power|mod = Power|BL * (Speed|mod / Speed|BL) ^3
          point.power = closestPowerVal * Math.pow((modificationEquipment.speed / equipmentInputs.baselineMeasurement), 3);
        }
        //copy for conversions
        let pointCopy = JSON.parse(JSON.stringify(point));
        //flow ft3/min
        let flow = this.convertUnitsService.value(pointCopy.x).from(settings.fanFlowRate).to('ft3/min');
        //pressure inH20
        let pressure = this.convertUnitsService.value(pointCopy.y).from(settings.fanPressureMeasurement).to('inH2o');
        //power hp
        let power = this.convertUnitsService.value(pointCopy.power).from(settings.powerMeasurement).to('hp');
        point.efficiency = (((flow * pressure * systemCurveData.compressibilityFactor) / 6362) / power) * 100;
      }
    }
    return point;
  }


  calculateByDataRegression(equipmentType: string, maxFlowRate: number) {
    if (this.byDataInputs.getValue() != undefined && this.equipmentInputs.getValue() != undefined) {
      let secondValueLabel: string = 'Head';
      let powerDataPairs;
      // * 
      this.setCoordinatePairIncrement(maxFlowRate);
      // Should send in copy of modificationEquipment?
      powerDataPairs = this.regressionEquationsService.getEquipmentPowerRegressionByData(this.byDataInputs.getValue(), this.modificationEquipment.getValue(), this.equipmentInputs.getValue(), maxFlowRate);
      if (equipmentType == 'fan') {
        secondValueLabel = 'Pressure';
      } 
      // else {
      //   equipmentType = 'pump';
      // }
      let curveRegressionData: CurveRegressionData = this.regressionEquationsService.getEquipmentCurveRegressionByData(this.byDataInputs.getValue(), this.equipmentInputs.getValue(), this.modificationEquipment.getValue(), secondValueLabel, maxFlowRate, equipmentType);
      this.regressionEquationsService.baselineEquipmentCurveByDataRegressionEquation.next(curveRegressionData.baselineRegressionEquation);
      this.regressionEquationsService.baselineEquipmentCurveByDataRSquared.next(curveRegressionData.baselineRSquared);
      this.regressionEquationsService.modificationEquipmentCurveByDataRegressionEquation.next(curveRegressionData.modificationRegressionEquation);
      this.regressionEquationsService.modificationEquipmentCurveRSquared.next(curveRegressionData.modificationRSquared);
      if (this.selectedEquipmentCurveFormView.getValue() == 'Data') {
        this.baselineEquipmentCurveDataPairs = curveRegressionData.baselineDataPairs;
        this.modifiedEquipmentCurveDataPairs = curveRegressionData.modifiedDataPairs;
        this.baselinePowerDataPairs = powerDataPairs.baseline;
        this.modificationPowerDataPairs = powerDataPairs.modification;
      }
    }
  }

  // * previously set statically from fan data pair increment
  setCoordinatePairIncrement(maxFlowRate: number) {
    let increment = 2;
    if (maxFlowRate > this.medCoordinateLimit && maxFlowRate < this.highCoordinateLimit) {
      increment = Math.round(maxFlowRate / 100);
    } else if (maxFlowRate >= this.highCoordinateLimit) {
      increment = Math.round(maxFlowRate / 1000);
    }
    this.regressionEquationsService.dataPairCoordinateIncrement = increment;
    console.log('set dataPairIncrement', increment);
  }

  calculateByEquationRegressions(equipmentType: string, maxFlowRate: number, settings: Settings) {
    if (this.byEquationInputs.getValue() != undefined && this.equipmentInputs.getValue() != undefined) {
      let secondValueLabel: string = 'Head';
      let powerDataPairs;
      this.setCoordinatePairIncrement(maxFlowRate);
      powerDataPairs = this.regressionEquationsService.getEquipmentPowerRegressionByEquation(this.byEquationInputs.getValue(), this.equipmentInputs.getValue(), this.modificationEquipment.getValue(), maxFlowRate);
      if (equipmentType == 'fan') {
        secondValueLabel = 'Pressure';
      }
      let results = this.regressionEquationsService.getEquipmentCurveRegressionByEquation(this.byEquationInputs.getValue(), this.equipmentInputs.getValue(), this.modificationEquipment.getValue(), secondValueLabel, maxFlowRate);
      this.regressionEquationsService.baselineEquipmentCurveByEquationRegressionEquation.next(results.baselineRegressionEquation);
      this.regressionEquationsService.modificationEquipmentCurveByEquationRegressionEquation.next(results.modificationRegressionEquation);
      if (this.selectedEquipmentCurveFormView.getValue() == 'Equation') {
        this.baselineEquipmentCurveDataPairs = results.baselineDataPairs;
        this.modifiedEquipmentCurveDataPairs = results.modifiedDataPairs;
        this.baselinePowerDataPairs = powerDataPairs.baseline;
        this.modificationPowerDataPairs = powerDataPairs.modification;
      }
    }
  }

  calculateSystemCurveRegressionData(equipmentType: string, settings: Settings, maxFlowRate: number) {
    if (equipmentType == 'pump' && this.pumpSystemCurveData.getValue() != undefined) {
      this.setCoordinatePairIncrement(maxFlowRate);
      let systemCurveRegressionEquation: string = this.regressionEquationsService.getPumpSystemCurveRegressionEquation(this.pumpSystemCurveData.getValue());
      this.regressionEquationsService.systemCurveRegressionEquation.next(systemCurveRegressionEquation);
      this.systemCurveRegressionData = this.regressionEquationsService.calculatePumpSystemCurveData(this.pumpSystemCurveData.getValue(), maxFlowRate, settings);
      this.calculateModificationEquipment();
    } else if (equipmentType == 'fan' && this.fanSystemCurveData.getValue() != undefined) {
      this.setCoordinatePairIncrement(maxFlowRate);
      let systemCurveRegressionEquation: string = this.regressionEquationsService.getFanSystemCurveRegressionEquation(this.fanSystemCurveData.getValue());
      this.regressionEquationsService.systemCurveRegressionEquation.next(systemCurveRegressionEquation);
      this.systemCurveRegressionData = this.regressionEquationsService.calculateFanSystemCurveData(this.fanSystemCurveData.getValue(), maxFlowRate, settings);
      this.calculateModificationEquipment(true);
    }
  }

  calculateModificationEquipment(isFanEquipment = false) {
    let equipmentInputs = this.equipmentInputs.getValue();
    let modificationEquipment: ModificationEquipment = { head: 0, flow: 0, speed: 0 };

    // check if no pairs on reset
    if (this.baselineEquipmentCurveDataPairs && this.baselineEquipmentCurveDataPairs.length > 0) {
      let intersection = this.calculateIntersectionPoint(isFanEquipment);
      if (intersection) {
        let systemCurveIntersectionData: IntersectionData = { baseline: intersection };
        this.systemCurveIntersectionData.next(systemCurveIntersectionData)
        let systemCurveData: FanSystemCurveData | PumpSystemCurveData;
        if (isFanEquipment) {
          systemCurveData = this.fanSystemCurveData.getValue();
        } else {
          systemCurveData = this.pumpSystemCurveData.getValue();
        }
        if (systemCurveData.modificationCurve) {
          debugger;
          if (systemCurveData.modificationCurve.modificationMeasurementOption == 0) {
            debugger;
            // Flow input
            modificationEquipment = this.calculateModifiedYValue(modificationEquipment, systemCurveData)
          } else {
            // Head input
            modificationEquipment = this.calculateModifiedFlow(modificationEquipment, systemCurveData)
          }
          let baselineFlow = intersection.x;
          // new speed/diameter from affinity law
          modificationEquipment.speed = equipmentInputs.baselineMeasurement * (modificationEquipment.flow / baselineFlow);
          console.log('modificationequipment', modificationEquipment);
        }
      }
    }
    this.modificationEquipment.next(modificationEquipment);
  }

  isFanCurveData(curveData: FanSystemCurveData | PumpSystemCurveData): curveData is FanSystemCurveData {
    return (curveData as FanSystemCurveData).pointOnePressure !== undefined;
  }

  calculateModifiedYValue(modificationEquipment: ModificationEquipment, systemCurveData: PumpSystemCurveData | FanSystemCurveData) {
    let pointOneY: number;
    let pointTwoY: number;
    if (this.isFanCurveData(systemCurveData)) {
      pointOneY = systemCurveData.pointOnePressure;
      pointTwoY = systemCurveData.pointTwoPressure;
    } else {
      pointOneY = systemCurveData.pointOneHead;
      pointTwoY = systemCurveData.pointTwoHead;
    }
    // User input for OP 1 pressure passed in to get staticHead
    debugger;
    let staticHead: number = this.regressionEquationsService.calculateStaticHead(
      systemCurveData.pointOneFlowRate,
      pointOneY,
      systemCurveData.pointTwoFlowRate,
      pointTwoY,
      systemCurveData.systemLossExponent
    );
    let lossCoefficient: number = this.regressionEquationsService.calculateLossCoefficient(
      systemCurveData.pointOneFlowRate,
      pointOneY,
      systemCurveData.pointTwoFlowRate,
      pointTwoY,
      systemCurveData.systemLossExponent
    );
    let constant = lossCoefficient;
    let systemLossExponent = systemCurveData.systemLossExponent;

    // modificationHead = Static head + (constant * flow ^ system loss exponent)
    let modifiedYValue = staticHead + (constant * (Math.pow(systemCurveData.modificationCurve.modifiedFlow, systemLossExponent)));

    modificationEquipment.flow = systemCurveData.modificationCurve.modifiedFlow;
    if (this.isFanCurveData(systemCurveData)) {
      modificationEquipment.pressure = modifiedYValue;
    } else {
      modificationEquipment.head = modifiedYValue;
    }
    return modificationEquipment;
  }

  calculateModifiedFlow(modificationEquipment: ModificationEquipment, systemCurveData: PumpSystemCurveData | FanSystemCurveData) {
    let pointOneY: number;
    let pointTwoY: number;
    let modificationInput: number;
    if (this.isFanCurveData(systemCurveData)) {
      pointOneY = systemCurveData.pointOnePressure;
      pointTwoY = systemCurveData.pointTwoPressure;
      modificationInput = systemCurveData.modificationCurve.modifiedPressure;
    } else {
      pointOneY = systemCurveData.pointOneHead;
      pointTwoY = systemCurveData.pointTwoHead;
      modificationInput = systemCurveData.modificationCurve.modifiedHead;
    }
    let staticHead: number = this.regressionEquationsService.calculateStaticHead(
      systemCurveData.pointOneFlowRate,
      pointOneY,
      systemCurveData.pointTwoFlowRate,
      pointTwoY,
      systemCurveData.systemLossExponent
    );
    let lossCoefficient: number = this.regressionEquationsService.calculateLossCoefficient(
      systemCurveData.pointOneFlowRate,
      pointOneY,
      systemCurveData.pointTwoFlowRate,
      pointTwoY,
      systemCurveData.systemLossExponent
    );
    let constant = lossCoefficient;
    let systemLossExponent = systemCurveData.systemLossExponent;

    // modificationFlow = power((modificationHead - staticHead)/Constant, 1 / systemLossExponent) }
    let exp = 1 / systemLossExponent;
    let modifiedFlow = Math.pow((modificationInput - staticHead) / constant, exp);

    if (isNaN(modifiedFlow) || !isFinite(modifiedFlow)) {
      modifiedFlow = 0;
    }

    modificationEquipment.flow = modifiedFlow;
    if (this.isFanCurveData(systemCurveData)) {
      modificationEquipment.pressure = systemCurveData.modificationCurve.modifiedPressure;
    } else {
      modificationEquipment.head = systemCurveData.modificationCurve.modifiedHead;
    }
    return modificationEquipment;
  }

  calculateIntersectionPoint(isFanEquipment: boolean, isModification = false): { x: number, y: number } {
    let regressionEquations: RawEquations = this.regressionEquationsService.rawRegressionEquations.getValue();
    console.log('equations', regressionEquations);

    // intersection result format... [['x', 600], ['y', 300]]
    let intersection: Array<Array<string | number>>;

    let equipmentEquation = `${isFanEquipment? 'fan' : 'pump'}${isModification? 'Modification' : 'Baseline'}Equipment`;

    if (isFanEquipment) {
      // check if all equations include nan
      if (!regressionEquations.fanSystem.includes('NaN') && !regressionEquations[equipmentEquation].includes('NaN')) {
        intersection = nerdamer.solveEquations([regressionEquations.fanSystem, regressionEquations[equipmentEquation]]);
      }
    } else {
      if (!regressionEquations.pumpSystem.includes('NaN') && !regressionEquations[equipmentEquation].includes('NaN')) {
        intersection = nerdamer.solveEquations([regressionEquations.pumpSystem, regressionEquations[equipmentEquation]]);
      }
    }
    if (isModification) {
      console.log('mod intersection', intersection);
    } else {
      console.log('baseline intersection', intersection);
    }

    if (intersection) {
      console.log(intersection);
      let x: number = Number(intersection[0][1]);
      let y: number = Number(intersection[1][1]);
      
      let validIntersection = x && x > 0 && y && y > 0;
      // if (x && y) {
      if (validIntersection) {
        return {x: x, y: y};
      } else {
        return undefined;
      } 
    } else {
      return undefined;
    }
  }

}

export interface IntersectionData {
  baseline: SystemCurveDataPoint;
  modification?: SystemCurveDataPoint;
};
