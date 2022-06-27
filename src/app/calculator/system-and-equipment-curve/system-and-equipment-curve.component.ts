import { Component, OnInit, Input } from '@angular/core';
import { Assessment } from '../../shared/models/assessment';
import { Settings } from '../../shared/models/settings';
import { SettingsDbService } from '../../indexedDb/settings-db.service';
import { SystemAndEquipmentCurveService } from './system-and-equipment-curve.service';
import { firstValueFrom, Subscription } from 'rxjs';
import { Calculator } from '../../shared/models/calculators';
import { CalculatorDbService } from '../../indexedDb/calculator-db.service';
 
import { CurveDataService } from './curve-data.service';
import { Router } from '@angular/router';

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
  settings: Settings;

  calculatorTitle: string;
  tabSelect: string = 'results';
  curveDataSubscription: Subscription;
  byDataSubscription: Subscription;
  byEquationSubscription: Subscription;
  equipmentInputsSubscription: Subscription;
  equipmentCurveCollapsedSub: Subscription;
  systemCurveCollapsedSub: Subscription;
  maxFlowRate: number = 0;
  constructor(private settingsDbService: SettingsDbService, private systemAndEquipmentCurveService: SystemAndEquipmentCurveService,
    private calculatorDbService: CalculatorDbService,    private curveDataService: CurveDataService,
    private router: Router) { }

  ngOnInit() {
    if (!this.equipmentType) {
      this.setEquipmentType();
    }
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
          this.updateSystemCurveResultData();
        }
      });
    } else {
      this.curveDataSubscription = this.systemAndEquipmentCurveService.fanSystemCurveData.subscribe(val => {
        if (val != undefined) {
          this.updateSystemCurveResultData();
        }
      });
    }

    this.byDataSubscription = this.systemAndEquipmentCurveService.byDataInputs.subscribe(byDataInputs => {
      if (byDataInputs != undefined) {
        this.updateByDataResultData();
      }
    });

    this.byEquationSubscription = this.systemAndEquipmentCurveService.byEquationInputs.subscribe(byEquationInputs => {
      if (byEquationInputs != undefined) {
        this.updateByEquationResultData();
      }
    });

    this.equipmentInputsSubscription = this.systemAndEquipmentCurveService.equipmentInputs.subscribe(equipmentInputs => {
      if (equipmentInputs != undefined) {
        this.updateEquipmentCurveResultData();
      }
    });

    this.systemCurveCollapsedSub = this.systemAndEquipmentCurveService.systemCurveCollapsed.subscribe(val => {
      if (val != 'open') {
        this.updateEquipmentCurveResultData();
      }
    })
    this.equipmentCurveCollapsedSub = this.systemAndEquipmentCurveService.equipmentCurveCollapsed.subscribe(val => {
      if (val != 'open') {
        this.updateSystemCurveResultData();
      }
    });
  }

  ngOnDestroy() {
    this.equipmentInputsSubscription.unsubscribe();
    this.byDataSubscription.unsubscribe();
    this.byEquationSubscription.unsubscribe();
    this.curveDataSubscription.unsubscribe();
    this.systemCurveCollapsedSub.unsubscribe();
    this.equipmentCurveCollapsedSub.unsubscribe();
    if (this.assessment != undefined) {
      this.saveCalculator();
    }
    if (this.assessment == undefined) {
      if (this.equipmentType == 'fan') {
        this.systemAndEquipmentCurveService.fanByDataInputs = this.systemAndEquipmentCurveService.byDataInputs.getValue();
        this.systemAndEquipmentCurveService.fanByEquationInputs = this.systemAndEquipmentCurveService.byEquationInputs.getValue();
        this.systemAndEquipmentCurveService.fanEquipmentInputs = this.systemAndEquipmentCurveService.equipmentInputs.getValue();
        this.systemAndEquipmentCurveService.fanModificationCollapsed.next(undefined);
      } else {
        this.systemAndEquipmentCurveService.pumpByDataInputs = this.systemAndEquipmentCurveService.byDataInputs.getValue();
        this.systemAndEquipmentCurveService.pumpByEquationInputs = this.systemAndEquipmentCurveService.byEquationInputs.getValue();
        this.systemAndEquipmentCurveService.pumpEquipmentInputs = this.systemAndEquipmentCurveService.equipmentInputs.getValue();
        this.systemAndEquipmentCurveService.pumpModificationCollapsed.next(undefined);
      }
      this.systemAndEquipmentCurveService.byDataInputs.next(undefined);
      this.systemAndEquipmentCurveService.byEquationInputs.next(undefined);
      this.systemAndEquipmentCurveService.equipmentInputs.next(undefined);
      this.systemAndEquipmentCurveService.fanModificationCollapsed.next(undefined);
      this.systemAndEquipmentCurveService.modificationEquipment.next(undefined);
      this.systemAndEquipmentCurveService.modificationPowerDataPairs = undefined;
      this.systemAndEquipmentCurveService.baselinePowerDataPairs = undefined;
      this.systemAndEquipmentCurveService.modifiedEquipmentCurveDataPairs = undefined;
      this.systemAndEquipmentCurveService.existingInputUnits = this.settings.unitsOfMeasure;
    }
  }

  setEquipmentType() {
    if (this.router.url.indexOf('pump') != -1) {
      this.equipmentType = 'pump';
    } else if (this.router.url.indexOf('fan') != -1) {
      this.equipmentType = 'fan';
    }
  }

  updateSystemCurveResultData() {
    let newMaxFlow: number = this.systemAndEquipmentCurveService.getMaxFlowRate(this.equipmentType);
    this.systemAndEquipmentCurveService.calculateSystemCurveRegressionData(this.equipmentType, this.settings, newMaxFlow);
    this.maxFlowRate = newMaxFlow;
    this.updateEquipmentCurveResultData();
    this.systemAndEquipmentCurveService.updateGraph.next(true);
  }
  

  updateEquipmentCurveResultData() {
    if (this.systemAndEquipmentCurveService.selectedEquipmentCurveFormView.getValue() == 'Data') {
      this.updateByDataResultData();
    } else if (this.systemAndEquipmentCurveService.selectedEquipmentCurveFormView.getValue() == 'Equation') {
      this.updateByEquationResultData();
    }
  }

  updateByEquationResultData() {
    let newMaxFlow: number = this.systemAndEquipmentCurveService.getMaxFlowRate(this.equipmentType);
    this.systemAndEquipmentCurveService.calculateByEquationRegressions(this.equipmentType, newMaxFlow, this.settings);
    if (newMaxFlow != this.maxFlowRate) {
      this.maxFlowRate = newMaxFlow;
      this.updateSystemCurveResultData();
    } else {
      this.systemAndEquipmentCurveService.updateGraph.next(true);
    }
  }

  updateByDataResultData() {
    let newMaxFlow: number = this.systemAndEquipmentCurveService.getMaxFlowRate(this.equipmentType);
    this.systemAndEquipmentCurveService.calculateByDataRegression(this.equipmentType, newMaxFlow);
    if (newMaxFlow != this.maxFlowRate) {
      this.maxFlowRate = newMaxFlow;
      this.updateSystemCurveResultData();
    } else {
      this.systemAndEquipmentCurveService.updateGraph.next(true);
    }
  }

  setPersistantData() {
    if (this.equipmentType == 'fan' && this.assessment == undefined) {
      if (this.systemAndEquipmentCurveService.existingInputUnits == this.settings.unitsOfMeasure) {
        this.systemAndEquipmentCurveService.byDataInputs.next(this.systemAndEquipmentCurveService.fanByDataInputs);
        this.systemAndEquipmentCurveService.byEquationInputs.next(this.systemAndEquipmentCurveService.fanByEquationInputs);
        this.systemAndEquipmentCurveService.equipmentInputs.next(this.systemAndEquipmentCurveService.fanEquipmentInputs);
      } else {
        this.btnResetDefaults();
      }
    } else if (this.equipmentType == 'pump' && this.assessment == undefined) {
      if (this.systemAndEquipmentCurveService.existingInputUnits == this.settings.unitsOfMeasure) {
        this.systemAndEquipmentCurveService.byDataInputs.next(this.systemAndEquipmentCurveService.pumpByDataInputs);
        this.systemAndEquipmentCurveService.byEquationInputs.next(this.systemAndEquipmentCurveService.pumpByEquationInputs);
        this.systemAndEquipmentCurveService.equipmentInputs.next(this.systemAndEquipmentCurveService.pumpEquipmentInputs);
      } else {
        this.btnResetDefaults();
      }
    }
  }

  setTab(str: string) {
    this.tabSelect = str;
  }

  setCalculatorTitle() {
    if (this.equipmentType == 'fan') {
      this.calculatorTitle = 'Fan Curve'
      this.systemAndEquipmentCurveService.focusedCalculator.next('fan-curve');
      this.systemAndEquipmentCurveService.equipmentCurveCollapsed.next('open');
      this.systemAndEquipmentCurveService.systemCurveCollapsed.next('closed');
    } else {
      this.calculatorTitle = 'Pump Curve'
      this.systemAndEquipmentCurveService.focusedCalculator.next('pump-curve');
      this.systemAndEquipmentCurveService.equipmentCurveCollapsed.next('open');
      this.systemAndEquipmentCurveService.systemCurveCollapsed.next('closed');
    }
  }

  btnGenerateExample() {
    this.curveDataService.setExample(this.settings, this.equipmentType);
    this.curveDataService.generateExample.next(true);
    this.curveDataService.resetForms.next(true);
    this.curveDataService.resetForms.next(false);
  }

  btnResetDefaults() {
    this.curveDataService.resetData(this.equipmentType);
    this.setCalculatorTitle();
    this.curveDataService.resetForms.next(true);
    this.curveDataService.resetForms.next(false);
  }


  setAssessmentCalculatorData() {
    this.curveDataService.setAssessmentCalculatorData(this.equipmentType, this.assessment);
  }

  async saveCalculator() {
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

      let updatedCalculators: Calculator[] = await firstValueFrom(this.calculatorDbService.updateWithObservable(calculator)) 
      this.calculatorDbService.setAll(updatedCalculators);
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
      await firstValueFrom(this.calculatorDbService.addWithObservable(calculator));
      let updatedCalculators = await firstValueFrom(this.calculatorDbService.getAllCalculators());
      this.calculatorDbService.setAll(updatedCalculators);
    }
  }


}
