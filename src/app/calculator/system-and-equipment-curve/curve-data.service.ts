import { Injectable } from '@angular/core';
import { EquipmentCurveService } from './equipment-curve/equipment-curve.service';
import { FanSystemCurveFormService } from './system-curve/fan-system-curve-form.service';
import { PumpSystemCurveFormService } from './system-curve/pump-system-curve-form.service';
import { SystemAndEquipmentCurveService } from './system-and-equipment-curve.service';
import { PSAT } from '../../shared/models/psat';
import { FSAT } from '../../shared/models/fans';
import { Settings } from '../../shared/models/settings';
import { Assessment } from '../../shared/models/assessment';
import { Calculator } from '../../shared/models/calculators';
import { CalculatorDbService } from '../../indexedDb/calculator-db.service';
import { BehaviorSubject } from 'rxjs';
import { ByEquationInputs, EquipmentInputs, ByDataInputs, FanSystemCurveData, PumpSystemCurveData } from '../../shared/models/system-and-equipment-curve';

@Injectable()
export class CurveDataService {

  resetForms: BehaviorSubject<boolean>;
  constructor(private equipmentCurveService: EquipmentCurveService, private fanSystemCurveFormService: FanSystemCurveFormService,
    private pumpSystemCurveFormService: PumpSystemCurveFormService, private systemAndEquipmentCurveService: SystemAndEquipmentCurveService,
    private calculatorDbService: CalculatorDbService) {
    this.resetForms = new BehaviorSubject<boolean>(false);
  }


  setExample(settings: Settings, equipmentType: string) {
    if (equipmentType == 'pump') {
      let byDataInputs: ByDataInputs = this.equipmentCurveService.getPumpByDataExample(settings);
      this.systemAndEquipmentCurveService.byDataInputs.next(byDataInputs);
      let pumpSystemCurveData: PumpSystemCurveData = this.pumpSystemCurveFormService.getPumpSystemCurveDefaults(settings);
      this.systemAndEquipmentCurveService.pumpSystemCurveData.next(pumpSystemCurveData);
    } else if (equipmentType == 'fan') {
      let byDataInputs: ByDataInputs = this.equipmentCurveService.getFanByDataExample(settings);
      this.systemAndEquipmentCurveService.byDataInputs.next(byDataInputs);
      let fanSystemCurveData: FanSystemCurveData = this.fanSystemCurveFormService.getFanSystemCurveDefaults(settings);
      this.systemAndEquipmentCurveService.fanSystemCurveData.next(fanSystemCurveData);
    }
    let flowUnit: string;
    let yValueUnit: string;
    let yImperialUnit: string;
    if (equipmentType == 'fan') {
      flowUnit = settings.fanFlowRate;
      yValueUnit = settings.fanPressureMeasurement;
      yImperialUnit = 'inH2o';
    } else {
      flowUnit = settings.flowMeasurement;
      yValueUnit = settings.distanceMeasurement;
      yImperialUnit = 'ft';
    }

    let exampleByEquationInputs: ByEquationInputs = this.equipmentCurveService.getByEquationDefault(flowUnit, yValueUnit, yImperialUnit);
    this.systemAndEquipmentCurveService.byEquationInputs.next(exampleByEquationInputs);
    let exampleEquipment: EquipmentInputs = this.equipmentCurveService.getEquipmentCurveDefault();
    this.systemAndEquipmentCurveService.equipmentInputs.next(exampleEquipment);

    this.systemAndEquipmentCurveService.selectedEquipmentCurveFormView.next('Data');
    this.systemAndEquipmentCurveService.systemCurveCollapsed.next('open');
    this.systemAndEquipmentCurveService.equipmentCurveCollapsed.next('open');
  }


  resetData(equipmentType: string) {
    let exampleByEquationInputs: ByEquationInputs = this.equipmentCurveService.getResetByEquationInputs();
    this.systemAndEquipmentCurveService.byEquationInputs.next(exampleByEquationInputs);
    let exampleEquipment: EquipmentInputs = this.equipmentCurveService.getResetEquipmentInputs();
    this.systemAndEquipmentCurveService.equipmentInputs.next(exampleEquipment);
    let byDataInputs: ByDataInputs = this.equipmentCurveService.getResetByDataInputs();
    this.systemAndEquipmentCurveService.byDataInputs.next(byDataInputs);

    if (equipmentType == 'fan') {
      let fanSystemCurveData: FanSystemCurveData = this.fanSystemCurveFormService.getResetFanSystemCurveInputs();
      this.systemAndEquipmentCurveService.fanSystemCurveData.next(fanSystemCurveData);
    } else if (equipmentType == 'pump') {
      let pumpSystemCurveData: PumpSystemCurveData = this.pumpSystemCurveFormService.getResetPumpSystemCurveInputs();
      this.systemAndEquipmentCurveService.pumpSystemCurveData.next(pumpSystemCurveData);
    }
  }

  initializeDataFromPSAT(psat: PSAT) {
    let systemCurveDataPoints: Array<{ pointName: string, flowRate: number, yValue: number }> = this.getPumpSystemCurveDataPoints(psat);
    this.systemAndEquipmentCurveService.systemCurveDataPoints = systemCurveDataPoints;
    let pumpSystemCurveData: PumpSystemCurveData = {
      specificGravity: psat.inputs.specific_gravity,
      systemLossExponent: 1.9,
      pointOneFlowRate: 0,
      pointOneHead: 0,
      pointTwo: 'Baseline',
      pointTwoFlowRate: psat.inputs.flow_rate,
      pointTwoHead: psat.inputs.head,
    };
    this.systemAndEquipmentCurveService.pumpSystemCurveData.next(pumpSystemCurveData);
  }

  getPumpSystemCurveDataPoints(psat: PSAT): Array<{ pointName: string, flowRate: number, yValue: number }> {
    let dataPoints: Array<{ pointName: string, flowRate: number, yValue: number }> = new Array();
    dataPoints.push({
      pointName: 'Baseline',
      flowRate: psat.inputs.flow_rate,
      yValue: psat.inputs.head
    });
    if (psat.modifications) {
      psat.modifications.forEach(modification => {
        dataPoints.push({
          pointName: modification.psat.name,
          flowRate: modification.psat.inputs.flow_rate,
          yValue: modification.psat.inputs.head
        });
      })
    }
    return dataPoints;
  }

  initializeDataFromFSAT(fsat: FSAT) {
    let systemCurveDataPoints: Array<{ pointName: string, flowRate: number, yValue: number }> = this.getFanSystemCurveDataPoints(fsat);
    this.systemAndEquipmentCurveService.systemCurveDataPoints = systemCurveDataPoints;
    let fanSystemCurveData: FanSystemCurveData = {
      compressibilityFactor: fsat.fieldData.compressibilityFactor,
      systemLossExponent: .98,
      pointOneFlowRate: 0,
      pointOnePressure: 0,
      pointTwo: 'Baseline',
      pointTwoFlowRate: fsat.fieldData.flowRate,
      pointTwoPressure: fsat.fieldData.inletPressure - fsat.fieldData.outletPressure
    }
    this.systemAndEquipmentCurveService.fanSystemCurveData.next(fanSystemCurveData);
  }

  getFanSystemCurveDataPoints(fsat: FSAT): Array<{ pointName: string, flowRate: number, yValue: number }> {
    let dataPoints: Array<{ pointName: string, flowRate: number, yValue: number }> = new Array();
    dataPoints.push({
      pointName: 'Baseline',
      flowRate: fsat.fieldData.flowRate,
      yValue: fsat.fieldData.outletPressure - fsat.fieldData.inletPressure
    });
    if (fsat.modifications) {
      fsat.modifications.forEach(modification => {
        dataPoints.push({
          pointName: modification.fsat.name,
          flowRate: modification.fsat.fieldData.flowRate,
          yValue: modification.fsat.fieldData.outletPressure - modification.fsat.fieldData.inletPressure
        })
      })
    }
    return dataPoints;
  }

  setAssessmentCalculatorData(equipmentType: string, assessment: Assessment) {
    let calculator: Calculator = this.calculatorDbService.getByAssessmentId(assessment.id);
    if (calculator != undefined && calculator.systemAndEquipmentCurveData != undefined) {
      this.systemAndEquipmentCurveService.byDataInputs.next(calculator.systemAndEquipmentCurveData.byDataInputs);
      this.systemAndEquipmentCurveService.byEquationInputs.next(calculator.systemAndEquipmentCurveData.byEquationInputs);
      this.systemAndEquipmentCurveService.equipmentInputs.next(calculator.systemAndEquipmentCurveData.equipmentInputs);
      if (equipmentType == 'fan') {
        this.systemAndEquipmentCurveService.fanSystemCurveData.next(calculator.systemAndEquipmentCurveData.fanSystemCurveData);
        if (calculator.systemAndEquipmentCurveData.systemCurveDataPoints) {
          this.systemAndEquipmentCurveService.systemCurveDataPoints = calculator.systemAndEquipmentCurveData.systemCurveDataPoints;
        } else {
          this.systemAndEquipmentCurveService.systemCurveDataPoints = this.getFanSystemCurveDataPoints(assessment.fsat);
        }
      } else if (equipmentType == 'pump') {
        if (calculator.systemAndEquipmentCurveData.systemCurveDataPoints) {
          this.systemAndEquipmentCurveService.systemCurveDataPoints = calculator.systemAndEquipmentCurveData.systemCurveDataPoints;
        } else {
          this.systemAndEquipmentCurveService.systemCurveDataPoints = this.getPumpSystemCurveDataPoints(assessment.psat);
        }
        this.systemAndEquipmentCurveService.pumpSystemCurveData.next(calculator.systemAndEquipmentCurveData.pumpSystemCurveData);
      }
      this.systemAndEquipmentCurveService.selectedEquipmentCurveFormView.next(calculator.systemAndEquipmentCurveData.equipmentCurveFormView);

    } else {
      if (equipmentType == 'fan') {
        this.initializeDataFromFSAT(assessment.fsat);
      } else if (equipmentType == 'pump') {
        this.initializeDataFromPSAT(assessment.psat);
      }
    }
    this.systemAndEquipmentCurveService.equipmentCurveCollapsed.next("open");
    this.systemAndEquipmentCurveService.systemCurveCollapsed.next("open");
  }
}
