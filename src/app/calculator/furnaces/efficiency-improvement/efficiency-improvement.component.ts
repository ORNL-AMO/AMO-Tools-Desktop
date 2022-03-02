import { Component, OnInit, Input, ElementRef, ViewChild, HostListener } from '@angular/core';
import { EfficiencyImprovement, EfficiencyImprovementInputs, EfficiencyImprovementOutputs } from '../../../shared/models/phast/efficiencyImprovement';
import { PhastService } from '../../../phast/phast.service';
import { Settings } from '../../../shared/models/settings';
import { SettingsDbService } from '../../../indexedDb/settings-db.service';
import { EfficiencyImprovementService } from './efficiency-improvement.service';
import { Calculator } from '../../../shared/models/calculators';
import { IndexedDbService } from '../../../indexedDb/indexed-db.service';
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
  @Input()
  inTreasureHunt: boolean;

  @ViewChild('leftPanelHeader', { static: false }) leftPanelHeader: ElementRef;
  @ViewChild('contentContainer', { static: false }) contentContainer: ElementRef;
  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.resizeTabs();
  }

  containerHeight: number;

  efficiencyImprovementInputs: EfficiencyImprovementInputs;
  efficiencyImprovementOutputs: EfficiencyImprovementOutputs;

  efficiencyImprovement: EfficiencyImprovement;

  currentField: string = 'default';
  tabSelect: string = 'results';
  resetForm: boolean = true;
  baselineSelected: boolean = true;


  calcExists: boolean;
  saving: boolean;
  originalCalculator: Calculator;
  calculator: Calculator;
  efficiencyImprovementForm: FormGroup;
  constructor(private phastService: PhastService, private efficiencyImprovementService: EfficiencyImprovementService, private settingsDbService: SettingsDbService,
    private calculatorDbService: CalculatorDbService, private indexedDbService: IndexedDbService) { }


  ngOnInit() {
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

    this.calculate(this.efficiencyImprovement);
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.resizeTabs();
    }, 100);
  }

  btnResetData() {
    if (this.inAssessment && this.originalCalculator.efficiencyImprovement) {
      this.calculator = this.originalCalculator;
      this.efficiencyImprovement = this.calculator.efficiencyImprovement;
    }
    else {
      this.efficiencyImprovement = this.efficiencyImprovementService.getRestDataNewObj(this.settings);
    }
    this.resetForm = true;
    this.calculate(this.efficiencyImprovement);
  }

  btnGenerateExample() {
    this.efficiencyImprovement = this.efficiencyImprovementService.generateExampleNewObj(this.settings);
    this.calculate(this.efficiencyImprovement);
  }

  resizeTabs() {
    if (this.leftPanelHeader) {
      this.containerHeight = this.contentContainer.nativeElement.offsetHeight - this.leftPanelHeader.nativeElement.offsetHeight;
    }
  }

  setTab(str: string) {
    this.tabSelect = str;
  }


  calculate(data: EfficiencyImprovement) {
    this.efficiencyImprovement = data;
    this.efficiencyImprovementInputs = this.efficiencyImprovementService.getInputsFromObj(data);
    if (!this.inAssessment) {
      this.efficiencyImprovementService.efficiencyImprovement = this.efficiencyImprovement;
    } else if (this.inAssessment && this.calcExists) {
      this.calculator.efficiencyImprovement = this.efficiencyImprovement;
      this.saveCalculator();
    }
    this.efficiencyImprovementOutputs = this.phastService.efficiencyImprovement(this.efficiencyImprovementInputs, this.settings);
    this.efficiencyImprovement.results = this.phastService.efficiencyImprovementResults(data, this.efficiencyImprovementOutputs, this.settings);
  }

  setCurrentField(str: string) {
    this.currentField = str;
  }

  getCalculator() {
    this.calculator = this.calculatorDbService.getByAssessmentId(this.assessment.id);
    if (this.calculator) {
      this.calcExists = true;
      if (this.calculator.efficiencyImprovement) {
        this.efficiencyImprovement = this.calculator.efficiencyImprovement;
      } else {
        this.efficiencyImprovement = this.efficiencyImprovementService.getRestDataNewObj(this.settings);
        this.calculator.efficiencyImprovement = this.efficiencyImprovement;
        this.saveCalculator();
      }
    } else {
      this.calculator = this.initCalculator();
      this.saveCalculator();
    }
  }

  initCalculator(): Calculator {
    let tmpEfficiencyImprovement: EfficiencyImprovement = this.efficiencyImprovementService.generateExampleNewObj(this.settings);
    let tmpCalculator: Calculator = {
      assessmentId: this.assessment.id,
      efficiencyImprovement: tmpEfficiencyImprovement
    };
    return tmpCalculator;
  }

  initForm() {
    if (this.efficiencyImprovementService.efficiencyImprovement) {
      this.efficiencyImprovement = this.efficiencyImprovementService.efficiencyImprovement;
    } else {
      this.efficiencyImprovement = this.efficiencyImprovementService.generateExampleNewObj(this.settings);
    }
    this.calculate(this.efficiencyImprovement);
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
          });
        });
      }
    }
  }

  setBaselineSelected() {
    if (this.baselineSelected == false) {
      this.baselineSelected = true;
    }
  }

  setModificationSelected() {
    if (this.baselineSelected == true) {
      this.baselineSelected = false;
    }
  }

  createModification() {
    this.setModificationSelected();
  }

}
