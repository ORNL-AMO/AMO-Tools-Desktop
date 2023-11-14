import { Component, OnInit, Input, ElementRef, ViewChild, HostListener } from '@angular/core';
import { FlowCalculations, FlowCalculationsOutput } from '../../../shared/models/phast/flowCalculations';
import { PhastService } from '../../../phast/phast.service';
import { Settings } from '../../../shared/models/settings';
import { SettingsDbService } from '../../../indexedDb/settings-db.service';
import { EnergyUseService } from './energy-use.service';
import { Assessment } from '../../../shared/models/assessment';
import { Calculator } from '../../../shared/models/calculators';
 
import { CalculatorDbService } from '../../../indexedDb/calculator-db.service';
import { AnalyticsService } from '../../../shared/analytics/analytics.service';

@Component({
  selector: 'app-energy-use',
  templateUrl: './energy-use.component.html',
  styleUrls: ['./energy-use.component.css']
})
export class EnergyUseComponent implements OnInit {
  @Input()
  settings: Settings;
  @Input()
  assessment: Assessment;
  @Input()
  inAssessment: boolean;

  //for exportable table
  @ViewChild('copyTable', { static: false }) copyTable: ElementRef;
  tableString: any;

  @ViewChild('leftPanelHeader', { static: false }) leftPanelHeader: ElementRef;
  @ViewChild("contentContainer", { static: false }) contentContainer: ElementRef;
  @ViewChild('smallTabSelect', { static: false }) smallTabSelect: ElementRef;

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    setTimeout(() => {
      this.resizeTabs();
    }, 100);
  }

  flowCalculations: FlowCalculations;

  flowCalculationResults: FlowCalculationsOutput = {
    flow: 0,
    heatInput: 0,
    totalFlow: 0
  };
  containerHeight: number;
  headerHeight: number;
  smallScreenTab: string = 'form';
  currentField: string = 'default';
  tabSelect: string = 'results';
  saving: boolean;
  calculator: Calculator;
  originalCalculator: Calculator;
  constructor(private phastService: PhastService, private energyUseService: EnergyUseService, 
    private settingsDbService: SettingsDbService, private calculatorDbService: CalculatorDbService,
    private analyticsService: AnalyticsService) { }

  ngOnInit() {
    this.analyticsService.sendEvent('calculator-PH-energy-use');
    this.calculatorDbService.isSaving = false;
    if (!this.settings) {
      this.settings = this.settingsDbService.globalSettings;
    }
    if (this.settings.unitsOfMeasure == 'Custom') {
      this.settings.unitsOfMeasure = 'Imperial';
    }
    if (this.settingsDbService.globalSettings.defaultPanelTab) {
      this.tabSelect = this.settingsDbService.globalSettings.defaultPanelTab;
    }

    if (this.inAssessment) {
      this.getCalculator();
      this.originalCalculator = this.calculator;
    } else {
      this.initForm();
    }

    this.calculate();

    //update table string for exporting results
    this.updateTableString();
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.resizeTabs();
    }, 100);
  }

  btnResetData() {
    if (this.inAssessment && this.calculator.id) {
      this.calculator = this.originalCalculator;
    }
    else {
      this.flowCalculations = this.energyUseService.getResetData();
    }
    this.calculate();
  }

  btnGenerateExample() {
    if (!this.settings) {
      this.settings = this.settingsDbService.globalSettings;
    }
    this.flowCalculations = this.energyUseService.generateExample(this.settings);
    this.calculate();
  }

  resizeTabs() {
    if (this.leftPanelHeader.nativeElement.clientHeight) {
      this.headerHeight = this.leftPanelHeader.nativeElement.clientHeight;
      this.containerHeight = this.contentContainer.nativeElement.offsetHeight - this.leftPanelHeader.nativeElement.offsetHeight;
      if (this.smallTabSelect && this.smallTabSelect.nativeElement) {
        this.containerHeight = this.containerHeight - this.smallTabSelect.nativeElement.offsetHeight;
      }
    }
  }

  setCurrentField(str: string) {
    this.currentField = str;
  }

  setTab(str: string) {
    this.tabSelect = str;
    this.updateTableString();
  }

  async calculate() {
    if (!this.inAssessment) {
      this.flowCalculations = this.energyUseService.flowCalculations;
    } else if (this.inAssessment && this.calculator.id) {
      this.calculator.flowCalculations = this.flowCalculations;
      await this.calculatorDbService.saveAssessmentCalculator(this.assessment, this.calculator);
    }
    this.flowCalculationResults = this.phastService.flowCalculations(this.flowCalculations, this.settings);
    //update exportable table string whenever results are updated
    this.updateTableString();
  }

  async getCalculator() {
    this.calculator = this.calculatorDbService.getByAssessmentId(this.assessment.id);
    if (this.calculator) {
      if (this.calculator.flowCalculations) {
        this.flowCalculations = this.calculator.flowCalculations;
      } else {
        let tmpFlowCalculations: FlowCalculations = this.energyUseService.generateExample(this.settings);
        this.calculator.flowCalculations = tmpFlowCalculations;
        this.flowCalculations = this.calculator.flowCalculations;
       await this.calculatorDbService.saveAssessmentCalculator(this.assessment, this.calculator);
      }
    } else {
      this.calculator = this.initCalculator();
      this.flowCalculations = this.calculator.flowCalculations;
      await this.calculatorDbService.saveAssessmentCalculator(this.assessment, this.calculator);
    }
  }

  initCalculator(): Calculator {
    let tmpFlowCalculations: FlowCalculations = this.energyUseService.generateExample(this.settings);
    let tmpCalculator: Calculator = {
      assessmentId: this.assessment.id,
      flowCalculations: tmpFlowCalculations
    };
    return tmpCalculator;
  }

  initForm() {
    if (this.energyUseService.flowCalculations) {
      this.flowCalculations = this.energyUseService.flowCalculations;
    } else {
      this.flowCalculations = this.energyUseService.generateExample(this.settings);
    }
  }

  updateTableString() {
    if (this.tabSelect === 'results') {
      setTimeout(() => {
        this.tableString = this.copyTable.nativeElement.innerText;
      }, 25);
    }
  }

  setSmallScreenTab(selectedTab: string) {
    this.smallScreenTab = selectedTab;
  }
}
