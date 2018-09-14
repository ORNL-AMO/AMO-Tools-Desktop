import { Component, OnInit, Input, ElementRef, ViewChild, HostListener } from '@angular/core';
import { FlowCalculations, FlowCalculationsOutput } from '../../../shared/models/phast/flowCalculations';
import { PhastService } from '../../../phast/phast.service';
import { Settings } from '../../../shared/models/settings';
import { SettingsDbService } from '../../../indexedDb/settings-db.service';
import { EnergyUseService } from './energy-use.service';
import { Assessment } from '../../../shared/models/assessment';
import { Calculator } from '../../../shared/models/calculators';
import { IndexedDbService } from '../../../indexedDb/indexed-db.service';
import { CalculatorDbService } from '../../../indexedDb/calculator-db.service';

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

  @ViewChild('leftPanelHeader') leftPanelHeader: ElementRef;

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.resizeTabs();
  }

  flowCalculations: FlowCalculations;

  flowCalculationResults: FlowCalculationsOutput = {
    flow: 0,
    heatInput: 0,
    totalFlow: 0
  };
  headerHeight: number;
  currentField: string = 'default';
  tabSelect: string = 'results';
  calcExists: boolean;
  saving: boolean;
  calculator: Calculator;

  constructor(private phastService: PhastService, private energyUseService: EnergyUseService, private settingsDbService: SettingsDbService, private calculatorDbService: CalculatorDbService, private indexedDbService: IndexedDbService) { }

  ngOnInit() {
    if (!this.settings) {
      this.settings = this.settingsDbService.globalSettings;
    }
    if (this.settingsDbService.globalSettings.defaultPanelTab) {
      this.tabSelect = this.settingsDbService.globalSettings.defaultPanelTab;
    }

    if (this.inAssessment) {
      this.getCalculator();
    } else {
      this.initForm();
    }

    this.calculate();
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.resizeTabs();
    }, 100);
  }

  resizeTabs() {
    if (this.leftPanelHeader.nativeElement.clientHeight) {
      this.headerHeight = this.leftPanelHeader.nativeElement.clientHeight;
    }
  }

  setCurrentField(str: string) {
    this.currentField = str;
  }

  setTab(str: string) {
    this.tabSelect = str;
  }

  calculate() {
    if (!this.inAssessment) {
      this.energyUseService.flowCalculations = this.flowCalculations;
    } else if (this.inAssessment && this.calcExists) {
      this.calculator.flowCalculations = this.flowCalculations;
      this.saveCalculator();
    }
    this.flowCalculationResults = this.phastService.flowCalculations(this.flowCalculations, this.settings);
  }

  getCalculator() {
    this.calculator = this.calculatorDbService.getByAssessmentId(this.assessment.id);
    if (this.calculator) {
      this.calcExists = true;
      if (this.calculator.flowCalculations) {
        this.flowCalculations = this.calculator.flowCalculations;
      } else {
        let tmpFlowCalculations: FlowCalculations = this.energyUseService.initDefaultValues(this.settings);
        this.calculator.flowCalculations = tmpFlowCalculations;
        this.flowCalculations = this.calculator.flowCalculations;
        this.saveCalculator();
      }
    } else {
      this.calculator = this.initCalculator();
      this.flowCalculations = this.calculator.flowCalculations;
      this.saveCalculator();
    }
  }

  initCalculator(): Calculator {
    let tmpFlowCalculations: FlowCalculations = this.energyUseService.initDefaultValues(this.settings);
    let tmpCalculator: Calculator = {
      assessmentId: this.assessment.id,
      flowCalculations: tmpFlowCalculations
    }
    return tmpCalculator;
  }

  initForm() {
    if(this.energyUseService.flowCalculations){
      this.flowCalculations = this.energyUseService.flowCalculations;
    }else{
      this.flowCalculations = this.energyUseService.initDefaultValues(this.settings);
    }
  }

  saveCalculator() {
    if (!this.saving || this.calcExists) {
      if (this.calcExists) {
        this.indexedDbService.putCalculator(this.calculator).then(() => {
          this.calculatorDbService.setAll();
        });
      } else {
        this.saving = true;
        this.calculator.assessmentId = this.assessment.id;
        this.indexedDbService.addCalculator(this.calculator).then((result) => {
          this.calculatorDbService.setAll().then(() => {
            this.calculator.id = result;
            this.calcExists = true;
            this.saving = false;
          })
        });
      }
    }
  }
}
