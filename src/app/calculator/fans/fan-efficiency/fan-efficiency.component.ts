import { Component, OnInit, Input, ElementRef, ViewChild, HostListener } from '@angular/core';
import { FSAT } from '../../../shared/models/fans';
import { Settings } from '../../../shared/models/settings';
import { SettingsDbService } from '../../../indexedDb/settings-db.service';
import { FsatService } from '../../../fsat/fsat.service';
import { FanEfficiencyService, FanEfficiencyInputs } from './fan-efficiency.service';
import { UntypedFormGroup } from '@angular/forms';
import { Calculator } from '../../../shared/models/calculators';
import { CalculatorDbService } from '../../../indexedDb/calculator-db.service';
import { Assessment } from '../../../shared/models/assessment';
import { AnalyticsService } from '../../../shared/analytics/analytics.service';

@Component({
    selector: 'app-fan-efficiency',
    templateUrl: './fan-efficiency.component.html',
    styleUrls: ['./fan-efficiency.component.css'],
    standalone: false
})
export class FanEfficiencyComponent implements OnInit {
  @Input()
  fsat: FSAT;
  @Input()
  settings: Settings;
  @Input()
  assessment: Assessment;
  @Input()
  inAssessment: boolean;

  fanEfficiencyInputs: FanEfficiencyInputs;

  @ViewChild('leftPanelHeader', { static: false }) leftPanelHeader: ElementRef;
  @ViewChild('contentContainer', { static: false }) contentContainer: ElementRef;
  @ViewChild('smallTabSelect', { static: false }) smallTabSelect: ElementRef;

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    setTimeout(() => {
      this.resizeTabs();
    }, 100);
  }

  smallScreenTab: string = 'form';
  containerHeight: number;
  fanEfficiencyForm: UntypedFormGroup;
  headerHeight: number;
  currentField: string;
  tabSelect: string = 'results';
  fanEfficiency: number = 0;
  saving: boolean;
  calculator: Calculator;
  originalCalculator: Calculator;
  constructor(private fsatService: FsatService, private settingsDbService: SettingsDbService, private fanEfficiencyService: FanEfficiencyService,
    private calculatorDbService: CalculatorDbService,
    private analyticsService: AnalyticsService) { }

  ngOnInit() {
    this.analyticsService.sendEvent('calculator-FAN-efficiency');
    this.calculatorDbService.isSaving = false;
    if (this.inAssessment) {
      this.getCalculator();
      this.originalCalculator = this.calculator;
    } else {
      this.initForm();
    }

    if (!this.settings) {
      this.settings = this.settingsDbService.globalSettings;
    }
    if (this.settingsDbService.globalSettings.defaultPanelTab) {
      this.tabSelect = this.settingsDbService.globalSettings.defaultPanelTab;
    }
    this.calculate();
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.resizeTabs();
    }, 100);
  }

  btnResetData() {
    if (this.inAssessment && this.originalCalculator.fanEfficiencyInputs) {
      this.calculator = this.originalCalculator;
      this.fanEfficiencyForm = this.fanEfficiencyService.initFormFromObj(this.calculator.fanEfficiencyInputs);
    }
    else {
      this.fanEfficiencyForm = this.fanEfficiencyService.initForm();
    }
    this.calculate();
  }

  generateExample() {
    this.fanEfficiencyInputs = this.fanEfficiencyService.generateExample(this.settings);
    console.log(this.fanEfficiencyInputs)
    this.fanEfficiencyForm = this.fanEfficiencyService.initFormFromObj(this.fanEfficiencyInputs);
  }

  btnGenerateExample() {
    if (!this.settings) {
      this.settings = this.settingsDbService.globalSettings;
    }
    this.generateExample();
    this.calculate();
  }

  resizeTabs() {
    if (this.leftPanelHeader) {
      if (this.leftPanelHeader.nativeElement.clientHeight) {
        this.headerHeight = this.leftPanelHeader.nativeElement.clientHeight;
        this.containerHeight = this.contentContainer.nativeElement.offsetHeight - this.leftPanelHeader.nativeElement.offsetHeight;
        if (this.smallTabSelect && this.smallTabSelect.nativeElement) {
          this.containerHeight = this.containerHeight - this.smallTabSelect.nativeElement.offsetHeight;
        }
      }
    }
  }

  async calculate() {
    let tmpFanEfficiencyInputs: FanEfficiencyInputs = this.fanEfficiencyService.getObjFromForm(this.fanEfficiencyForm);
    if (!this.inAssessment) {
      this.fanEfficiencyService.fanEfficiencyInputs = tmpFanEfficiencyInputs;
    } else if (this.inAssessment && this.calculator.id) {
      this.calculator.fanEfficiencyInputs = tmpFanEfficiencyInputs;
      await this.calculatorDbService.saveAssessmentCalculator(this.assessment, this.calculator);
    }

    if (this.fanEfficiencyForm.valid) {
      this.fanEfficiency = this.fsatService.optimalFanEfficiency(tmpFanEfficiencyInputs, this.settings);
    } else {
      this.fanEfficiency = 0;
    }
  }

  setTab(str: string) {
    this.tabSelect = str;
  }

  changeField(str: string) {
    this.currentField = str;
  }

  async getCalculator() {
    this.calculator = this.calculatorDbService.getByAssessmentId(this.assessment.id);
    if (this.calculator) {
      if (this.calculator.fanEfficiencyInputs) {
        this.fanEfficiencyForm = this.fanEfficiencyService.initFormFromObj(this.calculator.fanEfficiencyInputs);
      } else {
        if (this.fsat && this.fsat.fanSetup && this.fsat.fanSetup.fanType !== 12) {
          this.fanEfficiencyForm = this.fanEfficiencyService.initFormFromFsat(this.fsat);
        } else {
          this.fanEfficiencyForm = this.fanEfficiencyService.initForm();
        }
        let tmpFanEfficiencyInputs: FanEfficiencyInputs = this.fanEfficiencyService.getObjFromForm(this.fanEfficiencyForm);
        this.calculator.fanEfficiencyInputs = tmpFanEfficiencyInputs;
        await this.calculatorDbService.saveAssessmentCalculator(this.assessment, this.calculator);
      }
    } else {
      this.calculator = this.initCalculator();
      await this.calculatorDbService.saveAssessmentCalculator(this.assessment, this.calculator);
      console.log('added calc id', this.calculator.id)
    }
  }

  initCalculator(): Calculator {
    if (this.fsat && this.fsat.fanSetup && this.fsat.fanSetup.fanType !== 12) {
      this.fanEfficiencyForm = this.fanEfficiencyService.initFormFromFsat(this.fsat);
    } else {
      this.fanEfficiencyForm = this.fanEfficiencyService.initForm();
    }
    let tmpFanEfficiencyInputs: FanEfficiencyInputs = this.fanEfficiencyService.getObjFromForm(this.fanEfficiencyForm);
    let tmpCalculator: Calculator = {
      assessmentId: this.assessment.id,
      fanEfficiencyInputs: tmpFanEfficiencyInputs
    };
    return tmpCalculator;
  }

  initForm() {
    if (this.fanEfficiencyService.fanEfficiencyInputs) {
      this.fanEfficiencyForm = this.fanEfficiencyService.initFormFromObj(this.fanEfficiencyService.fanEfficiencyInputs);
    } else {
      this.fanEfficiencyForm = this.fanEfficiencyService.initForm();
    }
  }

  setSmallScreenTab(selectedTab: string) {
    this.smallScreenTab = selectedTab;
  }
}
