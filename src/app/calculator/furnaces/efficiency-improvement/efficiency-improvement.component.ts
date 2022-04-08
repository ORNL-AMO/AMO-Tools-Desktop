import { Component, OnInit, Input, ElementRef, ViewChild, HostListener } from '@angular/core';
import { EfficiencyImprovementInputs, EfficiencyImprovementOutputs } from '../../../shared/models/phast/efficiencyImprovement';
import { PhastService } from '../../../phast/phast.service';
import { Settings } from '../../../shared/models/settings';
import { SettingsDbService } from '../../../indexedDb/settings-db.service';
import { EfficiencyImprovementService } from './efficiency-improvement.service';
import { Calculator } from '../../../shared/models/calculators';
 
import { CalculatorDbService } from '../../../indexedDb/calculator-db.service';
import { Assessment } from '../../../shared/models/assessment';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'app-efficiency-improvement',
  templateUrl: './efficiency-improvement.component.html',
  styleUrls: ['./efficiency-improvement.component.css']
})
export class EfficiencyImprovementComponent implements OnInit {
  @Input()
  settings: Settings;
  @Input()
  assessment: Assessment;
  @Input()
  inAssessment: boolean;

  @ViewChild('leftPanelHeader', {static: false}) leftPanelHeader: ElementRef;

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.resizeTabs();
  }

  headerHeight: number;

  efficiencyImprovementInputs: EfficiencyImprovementInputs;
  efficiencyImprovementOutputs: EfficiencyImprovementOutputs;

  currentField: string = 'default';
  tabSelect: string = 'results';
  resetForm: boolean = true;

  calcExists: boolean;
  saving: boolean;
  originalCalculator: Calculator;
  calculator: Calculator;
  efficiencyImprovementForm: FormGroup;
  constructor(private phastService: PhastService, private efficiencyImprovementService: EfficiencyImprovementService, private settingsDbService: SettingsDbService,
    private calculatorDbService: CalculatorDbService,  ) { }


  ngOnInit() {
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

    this.calculate(this.efficiencyImprovementInputs);
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.resizeTabs();
    }, 100);
  }

  btnResetData() {
    if (this.inAssessment && this.originalCalculator.efficiencyImprovementInputs) {
      this.calculator = this.originalCalculator;
      this.efficiencyImprovementInputs = this.calculator.efficiencyImprovementInputs;
    }
    else {
      this.efficiencyImprovementInputs = this.efficiencyImprovementService.getResetData();
    }
    this.efficiencyImprovementForm = this.efficiencyImprovementService.getFormFromObj(this.efficiencyImprovementInputs);
    this.resetForm = true;
    this.calculate(this.efficiencyImprovementInputs);
  }

  btnGenerateExample() {
    this.efficiencyImprovementInputs = this.efficiencyImprovementService.generateExample(this.settings);
    this.efficiencyImprovementForm = this.efficiencyImprovementService.getFormFromObj(this.efficiencyImprovementInputs);
    this.calculate(this.efficiencyImprovementInputs);
  }

  resizeTabs() {
    if (this.leftPanelHeader) {
      this.headerHeight = this.leftPanelHeader.nativeElement.clientHeight;
    }
  }

  setTab(str: string) {
    this.tabSelect = str;
  }


  calculate(data: EfficiencyImprovementInputs) {
    this.efficiencyImprovementInputs = data;
    if (!this.inAssessment) {
      this.efficiencyImprovementService.efficiencyImprovementInputs = this.efficiencyImprovementInputs;
    } else if (this.inAssessment && this.calcExists) {
      this.calculator.efficiencyImprovementInputs = this.efficiencyImprovementInputs;
      this.calculatorDbService.saveAssessmentCalculator(this.assessment, this.calculator);
    }
    this.efficiencyImprovementOutputs = this.phastService.efficiencyImprovement(this.efficiencyImprovementInputs, this.settings);
  }

  setCurrentField(str: string) {
    this.currentField = str;
  }

  getCalculator() {
    this.calculator = this.calculatorDbService.getByAssessmentId(this.assessment.id);
    if (this.calculator) {
      this.calcExists = true;
      if (this.calculator.efficiencyImprovementInputs) {
        this.efficiencyImprovementInputs = this.calculator.efficiencyImprovementInputs;
      } else {
        this.efficiencyImprovementInputs = this.efficiencyImprovementService.generateExample(this.settings);
        this.calculator.efficiencyImprovementInputs = this.efficiencyImprovementInputs;
        this.calculatorDbService.saveAssessmentCalculator(this.assessment, this.calculator);
      }
    } else {
      this.calculator = this.initCalculator();
      this.calculatorDbService.saveAssessmentCalculator(this.assessment, this.calculator);

    }
    this.efficiencyImprovementForm = this.efficiencyImprovementService.getFormFromObj(this.efficiencyImprovementInputs);
  }

  initCalculator(): Calculator {
    let tmpEfficiencyImprovementInputs: EfficiencyImprovementInputs = this.efficiencyImprovementService.generateExample(this.settings);
    let tmpCalculator: Calculator = {
      assessmentId: this.assessment.id,
      efficiencyImprovementInputs: tmpEfficiencyImprovementInputs
    };
    return tmpCalculator;
  }

  initForm() {
    if (this.efficiencyImprovementService.efficiencyImprovementInputs) {
      this.efficiencyImprovementInputs = this.efficiencyImprovementService.efficiencyImprovementInputs;
    } else {
      this.efficiencyImprovementInputs = this.efficiencyImprovementService.generateExample(this.settings);
    }
    this.efficiencyImprovementForm = this.efficiencyImprovementService.getFormFromObj(this.efficiencyImprovementInputs);
    this.calculate(this.efficiencyImprovementInputs);
  }
}
