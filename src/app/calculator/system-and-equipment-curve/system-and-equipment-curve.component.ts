import { Component, OnInit, Input, ElementRef, HostListener, ViewChild } from '@angular/core';
import { Assessment } from '../../shared/models/assessment';
import { Settings } from '../../shared/models/settings';
import { SettingsDbService } from '../../indexedDb/settings-db.service';
import { SystemAndEquipmentCurveService } from './system-and-equipment-curve.service';
import { firstValueFrom, merge, Observable, Subscription } from 'rxjs';
import { Calculator } from '../../shared/models/calculators';
import { CalculatorDbService } from '../../indexedDb/calculator-db.service';

import { CurveDataService } from './curve-data.service';
import { Router } from '@angular/router';
import { AnalyticsService } from '../../shared/analytics/analytics.service';
import { ByDataInputs, ByEquationInputs, EquipmentInputs, FanSystemCurveData, PumpSystemCurveData } from '../../shared/models/system-and-equipment-curve';

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

  @ViewChild('leftPanelHeader', { static: false }) leftPanelHeader: ElementRef;
  @ViewChild('smallTabSelect', { static: false }) smallTabSelect: ElementRef;
  @ViewChild('contentContainer', { static: false }) contentContainer: ElementRef;
  updateEquipmentCurvesSubscription: Subscription;
  formPanelCollapsedSubscription: Subscription;
  systemCurveUpdateSubscription: Subscription;

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    setTimeout(() => {
      this.resizeTabs();
    }, 100);
  }

  headerHeight: number;
  containerHeight: number;
  smallScreenTab: string = 'form';
  calculatorTitle: string;
  tabSelect: string = 'results';
  equipmentCurveUpdateObservable: Observable<ByDataInputs | ByEquationInputs | EquipmentInputs>;
  systemCurveUpdateObservable: Observable<PumpSystemCurveData | FanSystemCurveData>;
  formPanelCollapsedObservable: Observable<string>;
  maxFlowRate: number = 0;

  constructor(private settingsDbService: SettingsDbService, private systemAndEquipmentCurveService: SystemAndEquipmentCurveService,
    private calculatorDbService: CalculatorDbService, private curveDataService: CurveDataService,
    private router: Router,
    private analyticsService: AnalyticsService) { }

  ngOnInit() {
    this.analyticsService.sendEvent('calculator-system-equipment-curve');
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
    
    this.systemCurveUpdateObservable = merge(this.systemAndEquipmentCurveService.fanSystemCurveData, this.systemAndEquipmentCurveService.pumpSystemCurveData)
    this.systemCurveUpdateSubscription = this.systemCurveUpdateObservable.subscribe(val => {
      if (val != undefined) {
        this.updateSystemCurveResultData();
      }
    });
    
    this.equipmentCurveUpdateObservable = merge(this.systemAndEquipmentCurveService.byDataInputs, this.systemAndEquipmentCurveService.byEquationInputs, this.systemAndEquipmentCurveService.equipmentInputs);
    this.updateEquipmentCurvesSubscription = this.equipmentCurveUpdateObservable.subscribe(hasFormUpdates => {
      if (hasFormUpdates) {
        this.updateEquipmentCurves();
      }
    });
    
    this.formPanelCollapsedObservable = merge(this.systemAndEquipmentCurveService.systemCurveCollapsed, this.systemAndEquipmentCurveService.equipmentCurveCollapsed);
    this.formPanelCollapsedSubscription = this.formPanelCollapsedObservable.subscribe(val => {
      if (val != 'open') {
        this.updateEquipmentCurves();
      }
    });

  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.resizeTabs();
    }, 100);
  }

  updateSystemCurveResultData() {
    let newMaxFlow: number = this.systemAndEquipmentCurveService.getMaxFlowRate(this.equipmentType);
    this.systemAndEquipmentCurveService.calculateSystemCurveRegressionData(this.equipmentType, this.settings, newMaxFlow);
    this.maxFlowRate = newMaxFlow;
    this.updateEquipmentCurves();
    this.systemAndEquipmentCurveService.updateGraph.next(true);
  }

  updateEquipmentCurves() {
    let newMaxFlow: number = this.systemAndEquipmentCurveService.getMaxFlowRate(this.equipmentType);
    let hasEquipmentInputs: boolean = this.systemAndEquipmentCurveService.equipmentInputs.getValue() != undefined;
    let hasDataFormInputs: boolean = this.systemAndEquipmentCurveService.selectedEquipmentCurveFormView.getValue() == 'Data' && this.systemAndEquipmentCurveService.byDataInputs.getValue() != undefined && hasEquipmentInputs;
    let hasEquationFormInputs: boolean = this.systemAndEquipmentCurveService.selectedEquipmentCurveFormView.getValue() == 'Equation' && this.systemAndEquipmentCurveService.byEquationInputs.getValue() != undefined && hasEquipmentInputs;

    if (hasDataFormInputs) {
      this.systemAndEquipmentCurveService.calculateRegressionByData(this.equipmentType, newMaxFlow, this.settings);
    } else if (hasEquationFormInputs) {
      this.systemAndEquipmentCurveService.calculateRegressionByEquation(this.equipmentType, newMaxFlow, this.settings);
    }

    if (newMaxFlow != this.maxFlowRate) {
      this.maxFlowRate = newMaxFlow;
      this.updateSystemCurveResultData();
    } else {
      this.systemAndEquipmentCurveService.updateGraph.next(true);
    }
  }


  ngOnDestroy() {
    this.systemCurveUpdateSubscription.unsubscribe()
    this.updateEquipmentCurvesSubscription.unsubscribe()
    this.formPanelCollapsedSubscription.unsubscribe();

    if (this.assessment != undefined) {
      this.saveCalculator();
    } else {
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
      this.systemAndEquipmentCurveService.modificationEquipment.next(undefined);
      this.systemAndEquipmentCurveService.modificationPowerDataPairs = undefined;
      this.systemAndEquipmentCurveService.baselinePowerDataPairs = undefined;
      this.systemAndEquipmentCurveService.baselineEquipmentCurveDataPairs = undefined;
      this.systemAndEquipmentCurveService.modifiedEquipmentCurveDataPairs = undefined;
      this.systemAndEquipmentCurveService.existingInputUnits = this.settings.unitsOfMeasure;
      this.systemAndEquipmentCurveService.setDefaultCoordinatePairIncrement();
    }
  }


  resizeTabs() {
    if (this.leftPanelHeader && this.contentContainer) {
      this.headerHeight = this.leftPanelHeader.nativeElement.clientHeight;
      this.containerHeight = this.contentContainer.nativeElement.offsetHeight - this.headerHeight;
      if (this.smallTabSelect && this.smallTabSelect.nativeElement) {
        this.containerHeight = this.containerHeight - this.smallTabSelect.nativeElement.offsetHeight;
      }
    }
  }

  setSmallScreenTab(selectedTab: string) {
    this.smallScreenTab = selectedTab;
  }

  setEquipmentType() {
    if (this.router.url.indexOf('pump') != -1) {
      this.equipmentType = 'pump';
    } else if (this.router.url.indexOf('fan') != -1) {
      this.equipmentType = 'fan';
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

      await firstValueFrom(this.calculatorDbService.updateWithObservable(calculator));
      let updatedCalculators: Calculator[] = await firstValueFrom(this.calculatorDbService.getAllCalculators());
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
