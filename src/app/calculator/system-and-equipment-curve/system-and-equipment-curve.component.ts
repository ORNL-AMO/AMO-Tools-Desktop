import { Component, OnInit, Input } from '@angular/core';
import { Assessment } from '../../shared/models/assessment';
import { Settings } from '../../shared/models/settings';
import { SettingsDbService } from '../../indexedDb/settings-db.service';
import { SystemAndEquipmentCurveService, ByDataInputs, ByEquationInputs, EquipmentInputs } from './system-and-equipment-curve.service';
import { Subscription } from 'rxjs';
import { RegressionEquationsService } from './regression-equations/regression-equations.service';
import { SystemAndEquipmentCurveGraphService } from './system-and-equipment-curve-graph/system-and-equipment-curve-graph.service';
import { Calculator } from '../../shared/models/calculators';
import { CalculatorDbService } from '../../indexedDb/calculator-db.service';
import { IndexedDbService } from '../../indexedDb/indexed-db.service';

@Component({
  selector: 'app-system-and-equipment-curve',
  templateUrl: './system-and-equipment-curve.component.html',
  styleUrls: ['./system-and-equipment-curve.component.css']
})
export class SystemAndEquipmentCurveComponent implements OnInit {
  @Input()
  equipmentType: string;
  @Input()
  assessment: Assessment;
  @Input()
  isEquipmentCurvePrimary: boolean;
  @Input()
  settings: Settings;

  calculatorTitle: string;
  tabSelect: string = 'results';
  curveDataSubscription: Subscription;
  byDataSubscription: Subscription;
  byEquationSubscription: Subscription;
  equipmentInputsSubscription: Subscription;
  maxFlowRate: number = 0;
  maxFlowRateSubscription: Subscription;
  constructor(private settingsDbService: SettingsDbService, private systemAndEquipmentCurveService: SystemAndEquipmentCurveService,
    private regressionEquationsService: RegressionEquationsService, private systemAndEquipmentCurveGraphService: SystemAndEquipmentCurveGraphService,
    private calculatorDbService: CalculatorDbService, private indexedDbService: IndexedDbService) { }

  ngOnInit() {
    this.setCalculatorTitle();
    if (!this.settings) {
      this.settings = this.settingsDbService.globalSettings;
    }
    if (this.settingsDbService.globalSettings.defaultPanelTab) {
      this.tabSelect = this.settingsDbService.globalSettings.defaultPanelTab;
    }

    if (this.assessment != undefined) {
      this.setAssessmentCalculatorData();
    } else {
      this.setPersistantData();
    }

    if (this.equipmentType == 'pump') {
      this.curveDataSubscription = this.systemAndEquipmentCurveService.pumpSystemCurveData.subscribe(val => {
        if (val != undefined) {
          let systemCurveRegressionEquation: string = this.regressionEquationsService.getPumpSystemCurveRegressionEquation(val);
          this.regressionEquationsService.systemCurveRegressionEquation.next(systemCurveRegressionEquation);
        }
      });
    } else {
      this.curveDataSubscription = this.systemAndEquipmentCurveService.fanSystemCurveData.subscribe(val => {
        if (val != undefined) {
          let systemCurveRegressionEquation: string = this.regressionEquationsService.getFanSystemCurveRegressionEquation(val);
          this.regressionEquationsService.systemCurveRegressionEquation.next(systemCurveRegressionEquation);
        }
      });
    }

    this.byDataSubscription = this.systemAndEquipmentCurveService.byDataInputs.subscribe(byDataInputs => {
      if (byDataInputs != undefined) {
        let equipmentInputs: EquipmentInputs = this.systemAndEquipmentCurveService.equipmentInputs.getValue();
        if (equipmentInputs != undefined) {
          this.calculateByDataRegression(byDataInputs, equipmentInputs);
        }
      }
    });

    this.byEquationSubscription = this.systemAndEquipmentCurveService.byEquationInputs.subscribe(byEquationInputs => {
      if (byEquationInputs != undefined) {
        let equipmentInputs: EquipmentInputs = this.systemAndEquipmentCurveService.equipmentInputs.getValue();
        if (equipmentInputs != undefined) {
          this.calculateByEquationRegressions(byEquationInputs, equipmentInputs);
        }
      }
    });

    this.equipmentInputsSubscription = this.systemAndEquipmentCurveService.equipmentInputs.subscribe(equipmentInputs => {
      if (equipmentInputs != undefined) {
        let byDataInputs: ByDataInputs = this.systemAndEquipmentCurveService.byDataInputs.getValue();
        if (byDataInputs != undefined) {
          this.calculateByDataRegression(byDataInputs, equipmentInputs);
        }
        let byEquationInputs: ByEquationInputs = this.systemAndEquipmentCurveService.byEquationInputs.getValue();
        if (byEquationInputs != undefined) {
          this.calculateByEquationRegressions(byEquationInputs, equipmentInputs);
        }
      }
    });

    this.maxFlowRateSubscription = this.systemAndEquipmentCurveGraphService.maxFlowRate.subscribe(val => {
      if (this.maxFlowRate != val) {
        this.maxFlowRate = val;
        let equipmentInputs: EquipmentInputs = this.systemAndEquipmentCurveService.equipmentInputs.getValue();
        let byDataInputs: ByDataInputs = this.systemAndEquipmentCurveService.byDataInputs.getValue();
        let byEquationInputs: ByEquationInputs = this.systemAndEquipmentCurveService.byEquationInputs.getValue();
        if (equipmentInputs != undefined && byDataInputs != undefined) {
          this.calculateByDataRegression(byDataInputs, equipmentInputs);
        }
        if (equipmentInputs != undefined && byEquationInputs != undefined) {
          this.calculateByEquationRegressions(byEquationInputs, equipmentInputs);
        }
      }
    })
  }

  ngOnDestroy() {
    this.equipmentInputsSubscription.unsubscribe();
    this.byDataSubscription.unsubscribe();
    this.byDataSubscription.unsubscribe();
    this.curveDataSubscription.unsubscribe();
    this.maxFlowRateSubscription.unsubscribe();

    if (this.equipmentType == 'fan' && this.assessment == undefined) {
      this.systemAndEquipmentCurveService.fanByDataInputs = this.systemAndEquipmentCurveService.byDataInputs.getValue();
      this.systemAndEquipmentCurveService.fanByEquationInputs = this.systemAndEquipmentCurveService.byEquationInputs.getValue();
      this.systemAndEquipmentCurveService.fanEquipmentInputs = this.systemAndEquipmentCurveService.equipmentInputs.getValue();
      this.systemAndEquipmentCurveService.byDataInputs.next(undefined);
      this.systemAndEquipmentCurveService.byEquationInputs.next(undefined);
      this.systemAndEquipmentCurveService.equipmentInputs.next(undefined);
    } else if (this.equipmentType == 'pump') {
      this.systemAndEquipmentCurveService.pumpByDataInputs = this.systemAndEquipmentCurveService.byDataInputs.getValue();
      this.systemAndEquipmentCurveService.pumpByEquationInputs = this.systemAndEquipmentCurveService.byEquationInputs.getValue();
      this.systemAndEquipmentCurveService.pumpEquipmentInputs = this.systemAndEquipmentCurveService.equipmentInputs.getValue();
      this.systemAndEquipmentCurveService.byDataInputs.next(undefined);
      this.systemAndEquipmentCurveService.byEquationInputs.next(undefined);
      this.systemAndEquipmentCurveService.equipmentInputs.next(undefined);
    }
    if (this.assessment != undefined) {
      this.saveCalculator();
    }
    this.systemAndEquipmentCurveService.systemCurveDataPoints = undefined;
  }

  setPersistantData() {
    if (this.equipmentType == 'fan' && this.assessment == undefined) {
      this.systemAndEquipmentCurveService.byDataInputs.next(this.systemAndEquipmentCurveService.fanByDataInputs);
      this.systemAndEquipmentCurveService.byEquationInputs.next(this.systemAndEquipmentCurveService.fanByEquationInputs);
      this.systemAndEquipmentCurveService.equipmentInputs.next(this.systemAndEquipmentCurveService.fanEquipmentInputs);
    } else if (this.equipmentType == 'pump') {
      this.systemAndEquipmentCurveService.byDataInputs.next(this.systemAndEquipmentCurveService.pumpByDataInputs);
      this.systemAndEquipmentCurveService.byEquationInputs.next(this.systemAndEquipmentCurveService.pumpByEquationInputs);
      this.systemAndEquipmentCurveService.equipmentInputs.next(this.systemAndEquipmentCurveService.pumpEquipmentInputs);
    }
  }


  calculateByDataRegression(byDataInputs: ByDataInputs, equipmentInputs: EquipmentInputs) {
    let secondValueLabel: string = 'Head';
    if (this.equipmentType == 'fan') {
      secondValueLabel = 'Pressure';
    }
    let results = this.regressionEquationsService.getEquipmentCurveRegressionByData(byDataInputs, equipmentInputs, secondValueLabel, this.maxFlowRate);
    this.regressionEquationsService.baselineEquipmentCurveByDataRegressionEquation.next(results.baselineRegressionEquation);
    this.regressionEquationsService.baselineEquipmentCurveByDataRSquared.next(results.baselineRSquared);
    this.regressionEquationsService.modificationEquipmentCurveByDataRegressionEquation.next(results.modificationRegressionEquation);
    this.regressionEquationsService.modificationEquipmentCurveRSquared.next(results.modificationRSquared);
    if (this.systemAndEquipmentCurveService.selectedEquipmentCurveFormView.getValue() == 'Data') {
      this.systemAndEquipmentCurveService.baselineEquipmentCurveDataPairs.next(results.baselineDataPairs);
      this.systemAndEquipmentCurveService.modifiedEquipmentCurveDataPairs.next(results.modifiedDataPairs);
    }
  }

  calculateByEquationRegressions(byEquationInputs: ByEquationInputs, equipmentInputs: EquipmentInputs) {
    let secondValueLabel: string = 'Head';
    if (this.equipmentType == 'fan') {
      secondValueLabel = 'Pressure';
    }
    let results = this.regressionEquationsService.getEquipmentCurveRegressionByEquation(byEquationInputs, equipmentInputs, secondValueLabel, this.maxFlowRate);
    this.regressionEquationsService.baselineEquipmentCurveByEquationRegressionEquation.next(results.baselineRegressionEquation);
    this.regressionEquationsService.modificationEquipmentCurveByEquationRegressionEquation.next(results.modificationRegressionEquation);
    if (this.systemAndEquipmentCurveService.selectedEquipmentCurveFormView.getValue() == 'Equation') {
      this.systemAndEquipmentCurveService.baselineEquipmentCurveDataPairs.next(results.baselineDataPairs);
      this.systemAndEquipmentCurveService.modifiedEquipmentCurveDataPairs.next(results.modifiedDataPairs);
    }
  }

  setTab(str: string) {
    this.tabSelect = str;
  }

  setCalculatorTitle() {
    if (this.equipmentType == 'fan') {
      if (this.isEquipmentCurvePrimary == true) {
        this.calculatorTitle = 'Fan Curve'
        this.systemAndEquipmentCurveService.focusedCalculator.next('fan-curve');
        this.systemAndEquipmentCurveService.equipmentCurveCollapsed.next('open');
        this.systemAndEquipmentCurveService.systemCurveCollapsed.next('closed');
      } else {
        this.calculatorTitle = 'Fan System Curve';
        this.systemAndEquipmentCurveService.focusedCalculator.next('fan-system-curve');
        this.systemAndEquipmentCurveService.equipmentCurveCollapsed.next('closed');
        this.systemAndEquipmentCurveService.systemCurveCollapsed.next('open');
      }
    } else {
      if (this.isEquipmentCurvePrimary == true) {
        this.calculatorTitle = 'Pump Curve'
        this.systemAndEquipmentCurveService.focusedCalculator.next('pump-curve');
        this.systemAndEquipmentCurveService.equipmentCurveCollapsed.next('open');
        this.systemAndEquipmentCurveService.systemCurveCollapsed.next('closed');
      } else {
        this.calculatorTitle = 'Pump System Curve';
        this.systemAndEquipmentCurveService.focusedCalculator.next('pump-system-curve');
        this.systemAndEquipmentCurveService.equipmentCurveCollapsed.next('closed');
        this.systemAndEquipmentCurveService.systemCurveCollapsed.next('open');
      }
    }
  }

  btnGenerateExample() {
    this.systemAndEquipmentCurveService.setExample(this.settings, this.equipmentType);
    this.systemAndEquipmentCurveService.resetForms.next(true);
    this.systemAndEquipmentCurveService.resetForms.next(false);
  }

  btnResetDefaults() {
    this.systemAndEquipmentCurveService.resetData(this.equipmentType);
    this.setCalculatorTitle();
    this.systemAndEquipmentCurveService.resetForms.next(true);
    this.systemAndEquipmentCurveService.resetForms.next(false);
  }


  setAssessmentCalculatorData() {
    let calculator: Calculator = this.calculatorDbService.getByAssessmentId(this.assessment.id);
    if (calculator.systemAndEquipmentCurveData != undefined) {
      this.systemAndEquipmentCurveService.byDataInputs.next(calculator.systemAndEquipmentCurveData.byDataInputs);
      this.systemAndEquipmentCurveService.byEquationInputs.next(calculator.systemAndEquipmentCurveData.byEquationInputs);
      this.systemAndEquipmentCurveService.equipmentInputs.next(calculator.systemAndEquipmentCurveData.equipmentInputs);
      if (this.equipmentType == 'fan') {
        this.systemAndEquipmentCurveService.fanSystemCurveData.next(calculator.systemAndEquipmentCurveData.fanSystemCurveData);
        if (calculator.systemAndEquipmentCurveData.systemCurveDataPoints) {
          this.systemAndEquipmentCurveService.systemCurveDataPoints = calculator.systemAndEquipmentCurveData.systemCurveDataPoints;
        } else {
          this.systemAndEquipmentCurveService.systemCurveDataPoints = this.systemAndEquipmentCurveService.getFanSystemCurveDataPoints(this.assessment.fsat);
        }
      } else if (this.equipmentType == 'pump') {
        if (calculator.systemAndEquipmentCurveData.systemCurveDataPoints) {
          this.systemAndEquipmentCurveService.systemCurveDataPoints = calculator.systemAndEquipmentCurveData.systemCurveDataPoints;
        } else {
          this.systemAndEquipmentCurveService.systemCurveDataPoints = this.systemAndEquipmentCurveService.getPumpSystemCurveDataPoints(this.assessment.psat);
        }
        this.systemAndEquipmentCurveService.pumpSystemCurveData.next(calculator.systemAndEquipmentCurveData.pumpSystemCurveData);
      }
      this.systemAndEquipmentCurveService.selectedEquipmentCurveFormView.next(calculator.systemAndEquipmentCurveData.equipmentCurveFormView);

    } else {
      if (this.equipmentType == 'fan') {
        this.systemAndEquipmentCurveService.initializeDataFromFSAT(this.assessment.fsat);
      } else if (this.equipmentType == 'pump') {
        this.systemAndEquipmentCurveService.initializeDataFromPSAT(this.assessment.psat);
      }
    }
    this.systemAndEquipmentCurveService.equipmentCurveCollapsed.next("open");
    this.systemAndEquipmentCurveService.systemCurveCollapsed.next("open");
  }

  saveCalculator() {
    let calculator: Calculator = this.calculatorDbService.getByAssessmentId(this.assessment.id);
    if (calculator != undefined) {
      calculator.systemAndEquipmentCurveData = {
        pumpSystemCurveData: this.systemAndEquipmentCurveService.pumpSystemCurveData.getValue(),
        fanSystemCurveData: this.systemAndEquipmentCurveService.fanSystemCurveData.getValue(),
        byEquationInputs: this.systemAndEquipmentCurveService.byEquationInputs.getValue(),
        byDataInputs: this.systemAndEquipmentCurveService.byDataInputs.getValue(),
        equipmentInputs: this.systemAndEquipmentCurveService.equipmentInputs.getValue(),
        equipmentCurveFormView: this.systemAndEquipmentCurveService.selectedEquipmentCurveFormView.getValue()
      }

      this.indexedDbService.putCalculator(calculator).then(() => {
        this.calculatorDbService.setAll();
      });
    } else {
      calculator = {
        assessmentId: this.assessment.id,
        systemAndEquipmentCurveData: {
          pumpSystemCurveData: this.systemAndEquipmentCurveService.pumpSystemCurveData.getValue(),
          fanSystemCurveData: this.systemAndEquipmentCurveService.fanSystemCurveData.getValue(),
          byEquationInputs: this.systemAndEquipmentCurveService.byEquationInputs.getValue(),
          byDataInputs: this.systemAndEquipmentCurveService.byDataInputs.getValue(),
          equipmentInputs: this.systemAndEquipmentCurveService.equipmentInputs.getValue(),
          equipmentCurveFormView: this.systemAndEquipmentCurveService.selectedEquipmentCurveFormView.getValue()
        }
      };
      this.indexedDbService.addCalculator(calculator).then((result) => {
        this.calculatorDbService.setAll();
      });
    }
  }


}
