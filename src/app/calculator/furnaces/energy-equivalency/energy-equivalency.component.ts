import { Component, OnInit, Input, ElementRef, ViewChild, HostListener } from '@angular/core';
import { EnergyEquivalencyFuel, EnergyEquivalencyElectric, EnergyEquivalencyElectricOutput, EnergyEquivalencyFuelOutput } from '../../../shared/models/phast/energyEquivalency';
import { PhastService } from '../../../phast/phast.service';
import { Settings } from '../../../shared/models/settings';
import { SettingsDbService } from '../../../indexedDb/settings-db.service';
import { EnergyEquivalencyService } from './energy-equivalency.service';
import { Calculator } from '../../../shared/models/calculators';
import { IndexedDbService } from '../../../indexedDb/indexed-db.service';
import { CalculatorDbService } from '../../../indexedDb/calculator-db.service';
import { Assessment } from '../../../shared/models/assessment';

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

  @ViewChild('leftPanelHeader') leftPanelHeader: ElementRef;

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
  constructor(private phastService: PhastService, private energyEquivalencyService: EnergyEquivalencyService, private settingsDbService: SettingsDbService,
    private calculatorDbService: CalculatorDbService, private indexedDbService: IndexedDbService) { }

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


    this.calculateElectric();
    this.calculateFuel();
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

  calculateFuel() {
    if (!this.inAssessment) {
      this.energyEquivalencyService.energyEquivalencyFuel = this.energyEquivalencyFuel;
    } else if (this.inAssessment && this.calcExists) {
      this.calculator.energyEquivalencyInputs.energyEquivalencyFuel = this.energyEquivalencyFuel;
      this.saveCalculator();
    }
    this.energyEquivalencyFuelOutput = this.phastService.energyEquivalencyFuel(this.energyEquivalencyFuel, this.settings);
  }

  calculateElectric() {
    if (!this.inAssessment) {
      this.energyEquivalencyService.energyEquivalencyElectric = this.energyEquivalencyElectric;
    } else if (this.inAssessment && this.calcExists) {
      this.calculator.energyEquivalencyInputs.energyEquivalencyElectric = this.energyEquivalencyElectric;
      this.saveCalculator();
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
          energyEquivalencyElectric: this.energyEquivalencyService.initEquivalencyElectric(this.settings),
          energyEquivalencyFuel: this.energyEquivalencyService.initEquivalencyFuel()
        }
        this.calculator.energyEquivalencyInputs = tmpEnergyEquivalencyInputs;
        this.energyEquivalencyElectric = this.calculator.energyEquivalencyInputs.energyEquivalencyElectric;
        this.energyEquivalencyFuel = this.calculator.energyEquivalencyInputs.energyEquivalencyFuel;
        this.saveCalculator();
      }
    } else {
      this.calculator = this.initCalculator();
      this.saveCalculator();
    }
  }

  initCalculator(): Calculator {
    let tmpEnergyEquivalencyInputs: { energyEquivalencyFuel: EnergyEquivalencyFuel, energyEquivalencyElectric: EnergyEquivalencyElectric } = {
      energyEquivalencyElectric: this.energyEquivalencyService.initEquivalencyElectric(this.settings),
      energyEquivalencyFuel: this.energyEquivalencyService.initEquivalencyFuel()
    }
    let tmpCalculator: Calculator = {
      assessmentId: this.assessment.id,
      energyEquivalencyInputs: tmpEnergyEquivalencyInputs
    }
    return tmpCalculator;
  }

  initForm() {
    if (this.energyEquivalencyService.energyEquivalencyElectric) {
      this.energyEquivalencyElectric = this.energyEquivalencyService.energyEquivalencyElectric;
    } else {
      this.energyEquivalencyElectric = this.energyEquivalencyService.initEquivalencyElectric(this.settings);
    }

    if (this.energyEquivalencyService.energyEquivalencyFuel) {
      this.energyEquivalencyFuel = this.energyEquivalencyService.energyEquivalencyFuel;
    } else {
      this.energyEquivalencyFuel = this.energyEquivalencyService.initEquivalencyFuel();
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
