import { Component, OnInit, Input, ElementRef, ViewChild, HostListener } from '@angular/core';
import { PSAT } from '../../../shared/models/psat';
import { Settings } from '../../../shared/models/settings';
import { UntypedFormGroup } from '@angular/forms';
import { SettingsDbService } from '../../../indexedDb/settings-db.service';
import { NemaEnergyEfficiencyService, NemaInputs } from './nema-energy-efficiency.service';
import { Assessment } from '../../../shared/models/assessment';
import { Calculator } from '../../../shared/models/calculators';
import { CalculatorDbService } from '../../../indexedDb/calculator-db.service';
import { PsatService } from '../../../psat/psat.service';
import { FSAT } from '../../../shared/models/fans';
import { AnalyticsService } from '../../../shared/analytics/analytics.service';

@Component({
  selector: 'app-nema-energy-efficiency',
  templateUrl: './nema-energy-efficiency.component.html',
  styleUrls: ['./nema-energy-efficiency.component.css']
})
export class NemaEnergyEfficiencyComponent implements OnInit {
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
  containerHeight: number;
  smallScreenTab: string = 'form';

  currentField: string;
  nemaForm: UntypedFormGroup;
  tabSelect: string = 'results';
  saving: boolean;
  calculator: Calculator;
  tefcValue: number;

  constructor(private settingsDbService: SettingsDbService, private psatService: PsatService, private nemaEnergyEfficiencyService: NemaEnergyEfficiencyService, 
    private calculatorDbService: CalculatorDbService,
    private analyticsService: AnalyticsService) { }

  ngOnInit() {
    this.analyticsService.sendEvent('calculator-nema-energy-efficiency');
    this.calculatorDbService.isSaving = false;
    if (!this.settings) {
      this.settings = this.settingsDbService.globalSettings;
    }
    if (this.inAssessment) {
      this.getCalculator();
    } else {
      this.initForm();
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

  async getCalculator() {
    this.calculator = this.calculatorDbService.getByAssessmentId(this.assessment.id);
    if (this.calculator) {
      if (this.calculator.nemaInputs) {
        this.nemaForm = this.nemaEnergyEfficiencyService.initFormFromObj(this.calculator.nemaInputs);
      } else {
        if (this.psat) {
          this.nemaForm = this.nemaEnergyEfficiencyService.initFormFromPsat(this.psat);
        } else if (this.fsat) {
          this.nemaForm = this.nemaEnergyEfficiencyService.initFormFromFsat(this.fsat);
        } else {
          this.nemaForm = this.nemaEnergyEfficiencyService.initForm();
        }
        let tmpNemaInputs: NemaInputs = this.nemaEnergyEfficiencyService.getObjFromForm(this.nemaForm);
        this.calculator.nemaInputs = tmpNemaInputs;
        await this.calculatorDbService.saveAssessmentCalculator(this.assessment, this.calculator);
      }
    } else {
      this.calculator = this.initCalculator();
      await this.calculatorDbService.saveAssessmentCalculator(this.assessment, this.calculator);
    }
  }

  initCalculator(): Calculator {
    if (this.psat) {
      this.nemaForm = this.nemaEnergyEfficiencyService.initFormFromPsat(this.psat);
    } else if (this.fsat) {
      this.nemaForm = this.nemaEnergyEfficiencyService.initFormFromFsat(this.fsat);
    } else {
      this.nemaForm = this.nemaEnergyEfficiencyService.initForm();
    }
    let tmpNemaInputs: NemaInputs = this.nemaEnergyEfficiencyService.getObjFromForm(this.nemaForm);
    let tmpCalculator: Calculator = {
      assessmentId: this.assessment.id,
      nemaInputs: tmpNemaInputs
    };
    return tmpCalculator;
  }

  initForm() {
    if (this.nemaEnergyEfficiencyService.nemaInputs) {
      this.nemaForm = this.nemaEnergyEfficiencyService.initFormFromObj(this.nemaEnergyEfficiencyService.nemaInputs);
    } else {
      this.nemaForm = this.nemaEnergyEfficiencyService.resetForm();
      if (this.settings.powerMeasurement !== 'hp') {
        if (this.nemaForm.controls.horsePower.value === 200) {
          this.nemaForm.patchValue({
            horsePower: 150
          });
        }
      }
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

  setTab(str: string) {
    this.tabSelect = str;
  }

  changeField(str: string) {
    this.currentField = str;
  }

  async calculate() {
    if (this.nemaForm.valid) {
      // const efficiency = this.psatService.getEfficiencyFromForm(this.nemaForm);
      this.tefcValue = this.psatService.nema(
        this.nemaForm.controls.frequency.value,
        this.nemaForm.controls.motorRPM.value,
        this.nemaForm.controls.efficiencyClass.value,
        this.nemaForm.controls.efficiency.value,
        this.nemaForm.controls.horsePower.value,
        this.settings
      );
    } else {
      this.tefcValue = 0;
    }

    if (!this.psat && !this.inAssessment) {
      this.nemaEnergyEfficiencyService.nemaInputs = this.nemaEnergyEfficiencyService.getObjFromForm(this.nemaForm);
    } else if (this.inAssessment && this.calculator.id) {
      this.calculator.nemaInputs = this.nemaEnergyEfficiencyService.getObjFromForm(this.nemaForm);
      await this.calculatorDbService.saveAssessmentCalculator(this.assessment, this.calculator);
    }
  }

  btnResetData() {
    this.nemaForm = this.nemaEnergyEfficiencyService.resetForm();
    if (this.settings.powerMeasurement === 'hp') {
      this.nemaForm.patchValue({
        horsePower: 200
      });
    } else if (this.settings.unitsOfMeasure === 'Metric' && this.settings.powerMeasurement !== 'hp') {
      this.nemaForm.patchValue({
        horsePower: 150
      });
    }
    this.calculate();
  }

  btnGenerateExample() {
    this.nemaForm = this.nemaEnergyEfficiencyService.initForm();
    if (this.settings.powerMeasurement === 'hp') {
      this.nemaForm.patchValue({
        horsePower: 200
      });
    } else if (this.settings.unitsOfMeasure === 'Metric' && this.settings.powerMeasurement !== 'hp') {
      this.nemaForm.patchValue({
        horsePower: 150
      });
    }
    this.calculate();
  }

  setSmallScreenTab(selectedTab: string) {
    this.smallScreenTab = selectedTab;
  }

}
