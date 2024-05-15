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
  generateExample: BehaviorSubject<boolean>;
  constructor(private equipmentCurveService: EquipmentCurveService, private fanSystemCurveFormService: FanSystemCurveFormService,
    private pumpSystemCurveFormService: PumpSystemCurveFormService, private systemAndEquipmentCurveService: SystemAndEquipmentCurveService,
    private calculatorDbService: CalculatorDbService) {
    this.resetForms = new BehaviorSubject<boolean>(false);
    this.generateExample = new BehaviorSubject<boolean>(false);
  }

  setExample(settings: Settings, equipmentType: string) {
    if (equipmentType == 'pump') {
      let byDataInputs: ByDataInputs = this.equipmentCurveService.getPumpByDataExample(settings);
      this.systemAndEquipmentCurveService.byDataInputs.next(byDataInputs);
      this.systemAndEquipmentCurveService.pumpModificationCollapsed.next('open');
      let pumpSystemCurveData: PumpSystemCurveData = this.pumpSystemCurveFormService.getPumpSystemCurveExample(settings);
      this.systemAndEquipmentCurveService.resetModificationEquipment();
      this.systemAndEquipmentCurveService.pumpSystemCurveData.next(pumpSystemCurveData);
    } else if (equipmentType == 'fan') {
      let byDataInputs: ByDataInputs = this.equipmentCurveService.getFanByDataExample(settings);
      this.systemAndEquipmentCurveService.byDataInputs.next(byDataInputs);
      this.systemAndEquipmentCurveService.fanModificationCollapsed.next('open');
      let fanSystemCurveData: FanSystemCurveData = this.fanSystemCurveFormService.getFanSystemCurveExample(settings);
      this.systemAndEquipmentCurveService.resetModificationEquipment();
      this.systemAndEquipmentCurveService.fanSystemCurveData.next(fanSystemCurveData);
    }
    let exampleByEquationInputs: ByEquationInputs;
    let exampleEquipment;
    if (equipmentType == 'fan') {
      exampleByEquationInputs = this.equipmentCurveService.getFanByEquationDefault(settings);
      this.systemAndEquipmentCurveService.byEquationInputs.next(exampleByEquationInputs);
    } else {
      exampleByEquationInputs = this.equipmentCurveService.getPumpByEquationDefault(settings);
    }
    
    exampleEquipment = this.equipmentCurveService.getEquipmentCurveExample();
    this.systemAndEquipmentCurveService.byEquationInputs.next(exampleByEquationInputs);
    this.systemAndEquipmentCurveService.equipmentInputs.next(exampleEquipment);
    this.systemAndEquipmentCurveService.selectedEquipmentCurveFormView.next('Data');
    this.systemAndEquipmentCurveService.systemCurveCollapsed.next('open');
    this.systemAndEquipmentCurveService.equipmentCurveCollapsed.next('open');
  }


  resetData(equipmentType: string) {
    let exampleByEquationInputs: ByEquationInputs = this.equipmentCurveService.getResetByEquationInputs();
    this.systemAndEquipmentCurveService.byEquationInputs.next(exampleByEquationInputs);
    let byDataInputs: ByDataInputs = this.equipmentCurveService.getResetByDataInputs();
    this.systemAndEquipmentCurveService.byDataInputs.next(byDataInputs);

    if (equipmentType == 'fan') {
      let exampleEquipment: EquipmentInputs = this.equipmentCurveService.getResetEquipmentInputs('fan');
      this.systemAndEquipmentCurveService.equipmentInputs.next(exampleEquipment);
      let fanSystemCurveData: FanSystemCurveData = this.fanSystemCurveFormService.getFanSystemCurveDefaults();
      this.systemAndEquipmentCurveService.fanSystemCurveData.next(fanSystemCurveData);
    } else if (equipmentType == 'pump') {
      let exampleEquipment: EquipmentInputs = this.equipmentCurveService.getResetEquipmentInputs('pump');
      this.systemAndEquipmentCurveService.equipmentInputs.next(exampleEquipment);
      let pumpSystemCurveData: PumpSystemCurveData = this.pumpSystemCurveFormService.getResetPumpSystemCurveInputs();
      this.systemAndEquipmentCurveService.pumpSystemCurveData.next(pumpSystemCurveData);
    }
  }

  initializeDataFromPSAT(psat: PSAT) {
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


  initializeDataFromFSAT(fsat: FSAT) {
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

  setAssessmentCalculatorData(equipmentType: string, assessment: Assessment) {
    let calculator: Calculator = this.calculatorDbService.getByAssessmentId(assessment.id);
    if (calculator != undefined && calculator.systemAndEquipmentCurveData != undefined) {
      this.systemAndEquipmentCurveService.byDataInputs.next(calculator.systemAndEquipmentCurveData.byDataInputs);
      this.systemAndEquipmentCurveService.byEquationInputs.next(calculator.systemAndEquipmentCurveData.byEquationInputs);
      this.systemAndEquipmentCurveService.equipmentInputs.next(calculator.systemAndEquipmentCurveData.equipmentInputs);
      if (equipmentType == 'fan') {
        this.systemAndEquipmentCurveService.fanSystemCurveData.next(calculator.systemAndEquipmentCurveData.fanSystemCurveData);
      } else if (equipmentType == 'pump') {
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
