import { Component, OnInit, Input, ElementRef, ViewChild, HostListener } from '@angular/core';
import { EfficiencyImprovementInputs, EfficiencyImprovementOutputs } from '../../../shared/models/phast/efficiencyImprovement';
import { PhastService } from '../../../phast/phast.service';
import { Settings } from '../../../shared/models/settings';
import { SettingsDbService } from '../../../indexedDb/settings-db.service';
import { EfficiencyImprovementService } from './efficiency-improvement.service';
import { Calculator } from '../../../shared/models/calculators';
import { IndexedDbService } from '../../../indexedDb/indexed-db.service';
import { CalculatorDbService } from '../../../indexedDb/calculator-db.service';
import { Assessment } from '../../../shared/models/assessment';

@Component({
  selector: 'app-efficiency-improvement',
  templateUrl: './efficiency-improvement.component.html',
  styleUrls: ['./efficiency-improvement.component.css']
})
export class EfficiencyImprovementComponent implements OnInit {
  @Input()
  settings: Settings
  @Input()
  assessment: Assessment;
  @Input()
  inAssessment: boolean;

  @ViewChild('leftPanelHeader') leftPanelHeader: ElementRef;

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.resizeTabs();
  }

  headerHeight: number;

  efficiencyImprovementInputs: EfficiencyImprovementInputs;
  efficiencyImprovementOutputs: EfficiencyImprovementOutputs;

  currentField: string = 'default';

  calcExists: boolean;
  saving: boolean;
  originalCalculator: Calculator;
  calculator: Calculator;

  constructor(private phastService: PhastService, private efficiencyImprovementService: EfficiencyImprovementService, private settingsDbService: SettingsDbService,
    private calculatorDbService: CalculatorDbService, private indexedDbService: IndexedDbService) { }


  ngOnInit() {
    if (!this.settings) {
      this.settings = this.settingsDbService.globalSettings;
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
      this.efficiencyImprovementInputs = this.efficiencyImprovementService.initDefaultValues(this.settings);
    }
    this.calculate(this.efficiencyImprovementInputs);
  }

  resizeTabs() {
    if (this.leftPanelHeader.nativeElement.clientHeight) {
      this.headerHeight = this.leftPanelHeader.nativeElement.clientHeight;
    }
  }

  calculate(data: EfficiencyImprovementInputs) {
    this.efficiencyImprovementInputs = data;
    if (!this.inAssessment) {
      this.efficiencyImprovementService.efficiencyImprovementInputs = this.efficiencyImprovementInputs;
    } else if (this.inAssessment && this.calcExists) {
      this.calculator.efficiencyImprovementInputs = this.efficiencyImprovementInputs;
      this.saveCalculator();
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
        this.efficiencyImprovementInputs = this.efficiencyImprovementService.initDefaultValues(this.settings);
        this.calculator.efficiencyImprovementInputs = this.efficiencyImprovementInputs;
        this.saveCalculator();
      }
    } else {
      this.calculator = this.initCalculator();
      this.saveCalculator();
    }
  }

  initCalculator(): Calculator {
    let tmpEfficiencyImprovementInputs: EfficiencyImprovementInputs = this.efficiencyImprovementService.initDefaultValues(this.settings);
    let tmpCalculator: Calculator = {
      assessmentId: this.assessment.id,
      efficiencyImprovementInputs: tmpEfficiencyImprovementInputs
    }
    return tmpCalculator;
  }

  initForm() {
    if (this.efficiencyImprovementService.efficiencyImprovementInputs) {
      this.efficiencyImprovementInputs = this.efficiencyImprovementService.efficiencyImprovementInputs;
    } else {
      this.efficiencyImprovementInputs = this.efficiencyImprovementService.initDefaultValues(this.settings);
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
