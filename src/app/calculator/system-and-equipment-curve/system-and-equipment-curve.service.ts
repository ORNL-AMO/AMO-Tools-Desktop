import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { ConvertUnitsService } from '../../shared/convert-units/convert-units.service';
import { Settings } from '../../shared/models/settings';

@Injectable()
export class SystemAndEquipmentCurveService {

  currentField: BehaviorSubject<string>;
  pumpSystemCurveData: BehaviorSubject<PumpSystemCurveData>;
  fanSystemCurveData: BehaviorSubject<FanSystemCurveData>;
  focusedCalculator: BehaviorSubject<string>;
  byDataInputs: BehaviorSubject<ByDataInputs>;
  equipmentInputs: BehaviorSubject<EquipmentInputs>;
  byEquationInputs: BehaviorSubject<ByEquationInputs>;
  selectedEquipmentCurveFormView: BehaviorSubject<string>;
  equipmentCurveCollapsed: BehaviorSubject<string>;
  systemCurveCollapsed: BehaviorSubject<string>;
  baselineEquipmentCurveDataPairs: BehaviorSubject<Array<{ x: number, y: number }>>;
  modifiedEquipmentCurveDataPairs: BehaviorSubject<Array<{ x: number, y: number }>>;
  resetForms: BehaviorSubject<boolean>;
  // systemCurveRegressionData: BehaviorSubject<Array<{ x: number, y: number, fluidPower: number }>>;
  constructor(private convertUnitsService: ConvertUnitsService) {
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
    this.baselineEquipmentCurveDataPairs = new BehaviorSubject(undefined);
    this.modifiedEquipmentCurveDataPairs = new BehaviorSubject(undefined);
    this.resetForms = new BehaviorSubject(false);
  }

  setExample(settings: Settings, equipmentType: string) {
    let tmpMaxFlow = 1020;
    let tmpYValConstant = 356.96;
    if (settings.flowMeasurement !== 'gpm') {
      tmpMaxFlow = Math.round(this.convertUnitsService.value(tmpMaxFlow).from('gpm').to(settings.flowMeasurement) * 100) / 100;
    }
    if (settings.distanceMeasurement !== 'ft') {
      tmpYValConstant = Math.round(this.convertUnitsService.value(tmpYValConstant).from('ft').to(settings.distanceMeasurement) * 100) / 100;
    }

    if (equipmentType == 'pump') {
      this.setPumpByDataExample(settings);
      this.setPumpSystemCurveExample(settings);
    } else if (equipmentType == 'fan') {
      this.setFanByDataExample(settings);
      this.setFanSystemCurveExample(settings);
    }

    let exampleByEquationInputs: ByEquationInputs = {
      maxFlow: tmpMaxFlow,
      equationOrder: 3,
      constant: tmpYValConstant,
      flow: -0.0686,
      flowTwo: 0.000005,
      flowThree: -0.00000008,
      flowFour: 0,
      flowFive: 0,
      flowSix: 0
    };
    this.byEquationInputs.next(exampleByEquationInputs);

    let exampleEquipment: EquipmentInputs = {
      measurementOption: 0,
      baselineMeasurement: 1800,
      modificationMeasurementOption: 0,
      modifiedMeasurement: 1800
    };
    this.equipmentInputs.next(exampleEquipment);

    this.selectedEquipmentCurveFormView.next('Data');
    this.systemCurveCollapsed.next('open');
    this.equipmentCurveCollapsed.next('open');
  }

  setFanSystemCurveExample(settings: Settings) {
    let systemCurveFlowRate: number = 115280;
    let fanSystemCurvePressure: number = 16.5;
    if (settings.fanFlowRate != 'ft3/min') {
      systemCurveFlowRate = Math.round(this.convertUnitsService.value(systemCurveFlowRate).from('ft3/min').to(settings.fanFlowRate) * 100) / 100;
    }
    if (settings.fanPressureMeasurement != 'inH2o') {
      fanSystemCurvePressure = Math.round(this.convertUnitsService.value(fanSystemCurvePressure).from('inH2o').to(settings.fanPressureMeasurement) * 100) / 100;
    }
    let exampleFanSystemCurveData: FanSystemCurveData = {
      compressibilityFactor: .98,
      systemLossExponent: 1.9,
      pointOneFlowRate: 0,
      pointOnePressure: 0,
      pointTwo: '',
      pointTwoFlowRate: systemCurveFlowRate,
      pointTwoPressure: fanSystemCurvePressure
    };
    this.fanSystemCurveData.next(exampleFanSystemCurveData);
  }

  setPumpSystemCurveExample(settings: Settings) {
    let systemCurveFlowRate: number = 600;
    let pumpSystemCurveHead: number = 1000;
    if (settings.flowMeasurement !== 'gpm') {
      systemCurveFlowRate = Math.round(this.convertUnitsService.value(systemCurveFlowRate).from('gpm').to(settings.flowMeasurement) * 100) / 100;
    }
    if (settings.distanceMeasurement !== 'ft') {
      pumpSystemCurveHead = Math.round(this.convertUnitsService.value(pumpSystemCurveHead).from('ft').to(settings.distanceMeasurement) * 100) / 100;
    }
    let examplePumpSystemCurveData: PumpSystemCurveData = {
      specificGravity: 1.0,
      systemLossExponent: 1.9,
      pointOneFlowRate: 0,
      pointOneHead: 0,
      pointTwo: '',
      pointTwoFlowRate: systemCurveFlowRate,
      pointTwoHead: pumpSystemCurveHead,
    };
    this.pumpSystemCurveData.next(examplePumpSystemCurveData);
  }

  setByEquationInputsExample() {

  }

  setEquipmentInputsExample() {

  }

  setFanByDataExample(settings: Settings) {
    let dataRows: Array<{ flow: number, yValue: number }> = [
      { flow: 0, yValue: 22.3 },
      { flow: 43200, yValue: 21.8 },
      { flow: 72050, yValue: 20.3 },
      { flow: 100870, yValue: 18 },
      { flow: 129700, yValue: 14.8 },
      { flow: 158500, yValue: 10.2 },
      { flow: 172900, yValue: 7.3 },
      { flow: 187300, yValue: 3.7 }
    ];

    dataRows.forEach(row => {
      if (settings.fanFlowRate != 'ft3/min') {
        row.flow = Math.round(this.convertUnitsService.value(row.yValue).from('ft3/min').to(settings.fanFlowRate) * 100) / 100;
      }
      if (settings.fanPressureMeasurement != 'inH2o') {
        row.yValue = Math.round(this.convertUnitsService.value(row.yValue).from('inH2o').to(settings.fanPressureMeasurement) * 100) / 100;
      }
    })

    let exampleByDataInputs: ByDataInputs = {
      dataRows: dataRows,
      dataOrder: 2
    };
    this.byDataInputs.next(exampleByDataInputs);
  }

  setPumpByDataExample(settings: Settings) {
    let dataRows: Array<{ flow: number, yValue: number }> = [
      { flow: 0, yValue: 355 },
      { flow: 100, yValue: 351 },
      { flow: 630, yValue: 294 },
      { flow: 1020, yValue: 202 }
    ]

    dataRows.forEach(row => {
      if (settings.flowMeasurement !== 'gpm') {
        row.flow = Math.round(this.convertUnitsService.value(row.flow).from('gpm').to(settings.flowMeasurement) * 100) / 100;
      }
      if (settings.distanceMeasurement !== 'ft') {
        row.yValue = Math.round(this.convertUnitsService.value(row.yValue).from('ft').to(settings.distanceMeasurement) * 100) / 100;
      }
    })
    let exampleByDataInputs: ByDataInputs = {
      dataRows: dataRows,
      dataOrder: 3
    };
    this.byDataInputs.next(exampleByDataInputs);
  }

}

export interface PumpSystemCurveData {
  specificGravity: number,
  systemLossExponent: number,
  pointOneFlowRate: number,
  pointOneHead: number,
  pointTwo: string,
  pointTwoFlowRate: number,
  pointTwoHead: number,
}

export interface FanSystemCurveData {
  compressibilityFactor: number,
  systemLossExponent: number,
  pointOneFlowRate: number,
  pointOnePressure: number,
  pointTwo: string,
  pointTwoFlowRate: number,
  pointTwoPressure: number
}


export interface ByEquationInputs {
  maxFlow: number,
  equationOrder: number,
  constant: number,
  flow: number,
  flowTwo: number,
  flowThree: number,
  flowFour: number,
  flowFive: number,
  flowSix: number
}

export interface EquipmentInputs {
  measurementOption: number,
  baselineMeasurement: number,
  modificationMeasurementOption: number,
  modifiedMeasurement: number
}

export interface ByDataInputs {
  dataRows: Array<{ flow: number, yValue: number }>,
  dataOrder: number
}