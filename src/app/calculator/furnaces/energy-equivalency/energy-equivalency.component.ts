import { Component, OnInit, Input, ElementRef, ViewChild, HostListener } from '@angular/core';
import { EnergyEquivalencyFuel, EnergyEquivalencyElectric, EnergyEquivalencyElectricOutput, EnergyEquivalencyFuelOutput } from '../../../shared/models/phast/energyEquivalency';
import { PhastService } from '../../../phast/phast.service';
import { Settings } from '../../../shared/models/settings';
import { SettingsDbService } from '../../../indexedDb/settings-db.service';
import { EnergyEquivalencyService } from './energy-equivalency.service';
import { Calculator } from '../../../shared/models/calculators';
import { CalculatorDbService } from '../../../indexedDb/calculator-db.service';
import { Assessment } from '../../../shared/models/assessment';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'app-energy-equivalency',
  templateUrl: './energy-equivalency.component.html',
  styleUrls: ['./energy-equivalency.component.css']
})
export class EnergyEquivalencyComponent implements OnInit {
  @Input()
  settings: Settings;
  @Input()
  assessment: Assessment;
  @Input()
  inAssessment: boolean;

  @ViewChild('leftPanelHeader', { static: false }) leftPanelHeader: ElementRef;

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.resizeTabs();
  }

  headerHeight: number;

  energyEquivalencyElectric: EnergyEquivalencyElectric;
  energyEquivalencyFuel: EnergyEquivalencyFuel;

  energyEquivalencyFuelOutput: EnergyEquivalencyFuelOutput = { fuelFiredHeatInput: 0 };
  energyEquivalencyElectricOutput: EnergyEquivalencyElectricOutput = { electricalHeatInput: 0 };

  currentField: string = 'default';
  tabSelect: string = 'results';
  calcExists: boolean;
  saving: boolean;
  calculator: Calculator;
  originalCalculator: Calculator;
  formElectric: FormGroup;
  formFuel: FormGroup;
  constructor(private phastService: PhastService, private energyEquivalencyService: EnergyEquivalencyService, private settingsDbService: SettingsDbService,
    private calculatorDbService: CalculatorDbService) { }

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

    this.calculateElectric();
    this.calculateFuel();
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
      this.energyEquivalencyFuel = this.energyEquivalencyService.getResetFuelData();
      this.energyEquivalencyService.energyEquivalencyFuel = this.energyEquivalencyFuel;
      this.energyEquivalencyElectric = this.energyEquivalencyService.getResetElectricData();
      this.energyEquivalencyService.energyEquivalencyElectric = this.energyEquivalencyElectric;
    }
    this.formElectric = this.energyEquivalencyService.getElectricFormFromObj(this.energyEquivalencyElectric);
    this.formFuel = this.energyEquivalencyService.getFuelFormFromObj(this.energyEquivalencyFuel);
    this.calculateFuel();
    this.calculateElectric();
  }

  generateExample() {
    this.energyEquivalencyElectric = this.energyEquivalencyService.getDefaultElectricData(this.settings);
    this.energyEquivalencyService.energyEquivalencyElectric = this.energyEquivalencyElectric;
    this.energyEquivalencyFuel = this.energyEquivalencyService.getDefaultFuelData(this.settings);
    this.energyEquivalencyService.energyEquivalencyFuel = this.energyEquivalencyFuel;
    this.formElectric = this.energyEquivalencyService.getElectricFormFromObj(this.energyEquivalencyElectric);
    this.formFuel = this.energyEquivalencyService.getFuelFormFromObj(this.energyEquivalencyFuel);
  }

  btnGenerateExample() {
    this.generateExample();
    this.calculateElectric();
    this.calculateFuel();
  }

  resizeTabs() {
    if (this.leftPanelHeader.nativeElement.clientHeight) {
      this.headerHeight = this.leftPanelHeader.nativeElement.clientHeight;
    }
  }

  updateFuel(data: EnergyEquivalencyFuel) {
    this.energyEquivalencyFuel = data;
    this.calculateFuel();
  }

  calculateFuel() {
    if (!this.inAssessment) {
      this.energyEquivalencyService.energyEquivalencyFuel = this.energyEquivalencyFuel;
    } else if (this.inAssessment && this.calcExists) {
      this.calculator.energyEquivalencyInputs.energyEquivalencyFuel = this.energyEquivalencyFuel;
      this.calculatorDbService.saveAssessmentCalculator(this.assessment, this.calculator);
    }
    this.energyEquivalencyFuelOutput = this.phastService.energyEquivalencyFuel(this.energyEquivalencyFuel, this.settings);
  }

  updateElectric(data: EnergyEquivalencyElectric) {
    this.energyEquivalencyElectric = data;
    this.calculateElectric();
  }

  calculateElectric() {
    if (!this.inAssessment) {
      this.energyEquivalencyService.energyEquivalencyElectric = this.energyEquivalencyElectric;
    } else if (this.inAssessment && this.calcExists) {
      this.calculator.energyEquivalencyInputs.energyEquivalencyElectric = this.energyEquivalencyElectric;
      this.calculatorDbService.saveAssessmentCalculator(this.assessment, this.calculator);
    }
    this.energyEquivalencyElectricOutput = this.phastService.energyEquivalencyElectric(this.energyEquivalencyElectric, this.settings);
  }

  setCurrentField(str: string) {
    this.currentField = str;
  }

  setTab(str: string) {
    this.tabSelect = str;
  }

  getCalculator() {
    this.calculator = this.calculatorDbService.getByAssessmentId(this.assessment.id);
    if (this.calculator) {
      this.calcExists = true;
      if (this.calculator.energyEquivalencyInputs) {
        this.energyEquivalencyElectric = this.calculator.energyEquivalencyInputs.energyEquivalencyElectric;
        this.energyEquivalencyFuel = this.calculator.energyEquivalencyInputs.energyEquivalencyFuel;
      } else {
        let tmpEnergyEquivalencyInputs: { energyEquivalencyFuel: EnergyEquivalencyFuel, energyEquivalencyElectric: EnergyEquivalencyElectric } = {
          energyEquivalencyElectric: this.energyEquivalencyService.getDefaultElectricData(this.settings),
          energyEquivalencyFuel: this.energyEquivalencyService.getDefaultFuelData(this.settings)
        };
        this.calculator.energyEquivalencyInputs = tmpEnergyEquivalencyInputs;
        this.energyEquivalencyElectric = this.calculator.energyEquivalencyInputs.energyEquivalencyElectric;
        this.energyEquivalencyFuel = this.calculator.energyEquivalencyInputs.energyEquivalencyFuel;
        this.calculatorDbService.saveAssessmentCalculator(this.assessment, this.calculator);

      }
    } else {
      this.calculator = this.initCalculator();
      this.calculatorDbService.saveAssessmentCalculator(this.assessment, this.calculator);

    }
    this.formElectric = this.energyEquivalencyService.getElectricFormFromObj(this.energyEquivalencyElectric);
    this.formFuel = this.energyEquivalencyService.getFuelFormFromObj(this.energyEquivalencyFuel);
  }

  initCalculator(): Calculator {
    let tmpEnergyEquivalencyInputs: { energyEquivalencyFuel: EnergyEquivalencyFuel, energyEquivalencyElectric: EnergyEquivalencyElectric } = {
      energyEquivalencyElectric: this.energyEquivalencyService.getDefaultElectricData(this.settings),
      energyEquivalencyFuel: this.energyEquivalencyService.getDefaultFuelData(this.settings)
    };
    let tmpCalculator: Calculator = {
      assessmentId: this.assessment.id,
      energyEquivalencyInputs: tmpEnergyEquivalencyInputs
    };
    return tmpCalculator;
  }

  initForm() {
    if (this.energyEquivalencyService.energyEquivalencyElectric) {
      this.energyEquivalencyElectric = this.energyEquivalencyService.energyEquivalencyElectric;
    } else {
      this.energyEquivalencyElectric = this.energyEquivalencyService.getDefaultElectricData(this.settings);
    }

    if (this.energyEquivalencyService.energyEquivalencyFuel) {
      this.energyEquivalencyFuel = this.energyEquivalencyService.energyEquivalencyFuel;
    } else {
      this.energyEquivalencyFuel = this.energyEquivalencyService.getDefaultFuelData(this.settings);
    }
    this.formElectric = this.energyEquivalencyService.getElectricFormFromObj(this.energyEquivalencyElectric);
    this.formFuel = this.energyEquivalencyService.getFuelFormFromObj(this.energyEquivalencyFuel);
  }

}
