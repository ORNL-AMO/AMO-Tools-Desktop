import { Component, OnInit, Input, ElementRef, ViewChild, HostListener, SimpleChanges } from '@angular/core';
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

  //for exportable table
  @ViewChild('copyTable') copyTable: ElementRef;
  tableString: any;

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
  originalCalculator: Calculator;
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
    if (this.inAssessment && this.calcExists) {
      this.calculator = this.originalCalculator;
    }
    else {
      this.flowCalculations = this.energyUseService.initDefaultValues(this.settings);
    }
    this.calculate();
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
    this.updateTableString();
  }

  calculate() {
    if (!this.inAssessment) {
      this.flowCalculations = this.energyUseService.flowCalculations;
    } else if (this.inAssessment && this.calcExists) {
      this.calculator.flowCalculations = this.flowCalculations;
      this.saveCalculator();
    }
    this.flowCalculationResults = this.phastService.flowCalculations(this.flowCalculations, this.settings);
    //update exportable table string whenever results are updated
    this.updateTableString();
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
    if (this.energyUseService.flowCalculations) {
      this.flowCalculations = this.energyUseService.flowCalculations;
    } else {
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

  updateTableString() {
    if (this.tabSelect === 'results') {
      setTimeout(() => {
        this.tableString = this.copyTable.nativeElement.innerText;
      }, 25);
    }
  }
}
