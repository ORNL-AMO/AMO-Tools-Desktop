import { Component, OnInit, Input, ElementRef, ViewChild, HostListener } from '@angular/core';
import { PSAT } from '../../../shared/models/psat';
import { Settings } from '../../../shared/models/settings';
import { UntypedFormGroup } from '@angular/forms';
import { SettingsDbService } from '../../../indexedDb/settings-db.service';
import { MotorPerformanceService, MotorPerformanceInputs } from './motor-performance.service';
import { Calculator } from '../../../shared/models/calculators';
import { CalculatorDbService } from '../../../indexedDb/calculator-db.service';
import { Assessment } from '../../../shared/models/assessment';
import { FSAT } from '../../../shared/models/fans';

@Component({
  selector: 'app-motor-performance',
  templateUrl: './motor-performance.component.html',
  styleUrls: ['./motor-performance.component.css']
})
export class MotorPerformanceComponent implements OnInit {
  @Input()
  psat: PSAT;
  @Input()
  fsat: FSAT;
  @Input()
  settings: Settings;
  @Input()
  assessment: Assessment;
  @Input()
  inAssessment: boolean;

  @ViewChild('leftPanelHeader', { static: false }) leftPanelHeader: ElementRef;
  @ViewChild('smallTabSelect', { static: false }) smallTabSelect: ElementRef;
  @ViewChild('contentContainer', { static: false }) contentContainer: ElementRef;

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    setTimeout(() => {
      this.resizeTabs();
    }, 100);
  }

  headerHeight: number;

  currentField: string;
  performanceForm: UntypedFormGroup;
  calculator: Calculator;
  toggleCalculate: boolean = false;
  tabSelect: string = 'results';
  saving: boolean;
  containerHeight: number;
  smallScreenTab: string = 'form';
  constructor(private settingsDbService: SettingsDbService, private motorPerformanceService: MotorPerformanceService, private calculatorDbService: CalculatorDbService) {
  }

  ngOnInit() {
    this.calculatorDbService.isSaving = false;
    if (this.inAssessment) {
      this.getCalculator();
    } else {
      this.initForm();
    }
    //use system settings for standalone calculator
    if (!this.settings) {
      this.settings = this.settingsDbService.globalSettings;
      if (this.settings.powerMeasurement !== 'hp' && !this.inAssessment) {
        this.performanceForm.patchValue({
          horsePower: '150'
        });
      }
    }

    if (this.settingsDbService.globalSettings.defaultPanelTab) {
      this.tabSelect = this.settingsDbService.globalSettings.defaultPanelTab;
    }
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.resizeTabs();
    }, 100);
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

 async calculate() {
    if (!this.psat && !this.inAssessment) {
      this.motorPerformanceService.motorPerformanceInputs = this.motorPerformanceService.getObjFromForm(this.performanceForm);
    } else if (this.inAssessment && this.calculator.id) {
      this.calculator.motorPerformanceInputs = this.motorPerformanceService.getObjFromForm(this.performanceForm);
      await this.calculatorDbService.saveAssessmentCalculator(this.assessment, this.calculator);
    }
    this.toggleCalculate = !this.toggleCalculate;
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
      if (this.calculator.motorPerformanceInputs) {
        this.performanceForm = this.motorPerformanceService.initFormFromObj(this.calculator.motorPerformanceInputs);
      } else {
        if (this.psat) {
          this.performanceForm = this.motorPerformanceService.initFormFromPsat(this.psat);
        } else if (this.fsat) {
          this.performanceForm = this.motorPerformanceService.initFormFromFsat(this.fsat);
        } else {
          this.performanceForm = this.motorPerformanceService.initForm();
        }
        let tmpMotorPerformanceInputs: MotorPerformanceInputs = this.motorPerformanceService.getObjFromForm(this.performanceForm);
        this.calculator.motorPerformanceInputs = tmpMotorPerformanceInputs;
        await this.calculatorDbService.saveAssessmentCalculator(this.assessment, this.calculator);
      }
    } else {
      this.calculator = this.initCalculator();
      await this.calculatorDbService.saveAssessmentCalculator(this.assessment, this.calculator);
    }
  }

  initCalculator(): Calculator {
    if (this.psat) {
      this.performanceForm = this.motorPerformanceService.initFormFromPsat(this.psat);
    } else if (this.fsat) {
      this.performanceForm = this.motorPerformanceService.initFormFromFsat(this.fsat);
    } else {
      this.performanceForm = this.motorPerformanceService.initForm();
    }
    let tmpMotorPerformanceInputs: MotorPerformanceInputs = this.motorPerformanceService.getObjFromForm(this.performanceForm);
    let tmpCalculator: Calculator = {
      assessmentId: this.assessment.id,
      motorPerformanceInputs: tmpMotorPerformanceInputs
    };
    return tmpCalculator;
  }

  initForm() {
    if (this.motorPerformanceService.motorPerformanceInputs) {
      this.performanceForm = this.motorPerformanceService.initFormFromObj(this.motorPerformanceService.motorPerformanceInputs);
    } else {
      this.performanceForm = this.motorPerformanceService.resetForm();
    }
  }

  btnResetData() {
    this.performanceForm = this.motorPerformanceService.resetForm();
    this.calculate();
  }

  btnGenerateExample() {
    this.performanceForm = this.motorPerformanceService.initForm();
    this.calculate();
  }

  setSmallScreenTab(selectedTab: string) {
    this.smallScreenTab = selectedTab;
  }
}
