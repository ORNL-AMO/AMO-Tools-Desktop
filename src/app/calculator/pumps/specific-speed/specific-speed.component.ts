import {Component, OnInit, Input, ElementRef, ViewChild, HostListener} from '@angular/core';
import {PSAT} from '../../../shared/models/psat';
import {Settings} from '../../../shared/models/settings';
import {IndexedDbService} from '../../../indexedDb/indexed-db.service';
import {FormGroup} from '@angular/forms';
import {SettingsDbService} from '../../../indexedDb/settings-db.service';
import {SpecificSpeedService} from './specific-speed.service';
import {Assessment} from '../../../shared/models/assessment';
import {Calculator, SpecificSpeedInputs} from '../../../shared/models/calculators';
import {CalculatorDbService} from '../../../indexedDb/calculator-db.service';

@Component({
  selector: 'app-specific-speed',
  templateUrl: './specific-speed.component.html',
  styleUrls: ['./specific-speed.component.css']
})
export class SpecificSpeedComponent implements OnInit {
  @Input()
  psat: PSAT;
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

  currentField: string;
  speedForm: FormGroup;
  specificSpeed: number;
  efficiencyCorrection: number;
  toggleCalculate: boolean = true;
  toggleResetData: boolean = true;
  tabSelect: string = 'results';
  calcExists: boolean;
  saving: boolean;
  calculator: Calculator;

  constructor(private specificSpeedService: SpecificSpeedService, private settingsDbService: SettingsDbService,
              private calculatorDbService: CalculatorDbService, private indexedDbService: IndexedDbService) {
  }

  ngOnInit() {
    if (!this.settings) {
      this.settings = this.settingsDbService.globalSettings;
    }

    //get settings if standalone
    if (this.settingsDbService.globalSettings.defaultPanelTab) {
      this.tabSelect = this.settingsDbService.globalSettings.defaultPanelTab;
    }

    if (this.inAssessment) {
      this.getCalculator();
    } else {
      this.initForm();
    }
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.resizeTabs();
    }, 100);
  }


  resizeTabs() {
    if (this.leftPanelHeader) {
      this.headerHeight = this.leftPanelHeader.nativeElement.clientHeight;
    }
  }

  calculate() {
    this.toggleCalculate = !this.toggleCalculate;
    if (!this.psat) {
      this.specificSpeedService.specificSpeedInputs = this.specificSpeedService.getObjFromForm(this.speedForm);
    } else if (this.inAssessment && this.calcExists) {
      this.calculator.specificSpeedInputs = this.specificSpeedService.getObjFromForm(this.speedForm);
      this.saveCalculator();
    }
  }

  setTab(str: string) {
    this.tabSelect = str;
  }

  changeField(str: string) {
    this.currentField = str;
  }

  getCalculator() {
    this.calculator = this.calculatorDbService.getByAssessmentId(this.assessment.id);
    if (this.calculator) {
      this.calcExists = true;
      if (this.calculator.specificSpeedInputs) {
        this.speedForm = this.specificSpeedService.initFormFromObj(this.calculator.specificSpeedInputs);
      } else {
        this.speedForm = this.specificSpeedService.initFormFromPsat(this.psat.inputs);
        let tmpSpecificSpeedInputs: SpecificSpeedInputs = this.specificSpeedService.getObjFromForm(this.speedForm);
        this.calculator.specificSpeedInputs = tmpSpecificSpeedInputs;
        this.saveCalculator();
      }
    } else {
      this.calculator = this.initCalculator();
      this.saveCalculator();
    }
  }

  initCalculator(): Calculator {
    this.speedForm = this.specificSpeedService.initFormFromPsat(this.psat.inputs);
    let tmpSpecificSpeedInputs: SpecificSpeedInputs = this.specificSpeedService.getObjFromForm(this.speedForm);
    let tmpCalculator: Calculator = {
      assessmentId: this.assessment.id,
      specificSpeedInputs: tmpSpecificSpeedInputs
    };
    return tmpCalculator;
  }

  initForm() {
    if (!this.psat) {
      if (!this.specificSpeedService.specificSpeedInputs) {
        this.speedForm = this.specificSpeedService.initForm(this.settings);
      } else {
        this.speedForm = this.specificSpeedService.initFormFromObj(this.specificSpeedService.specificSpeedInputs);
      }
    } else {
      this.speedForm = this.specificSpeedService.initFormFromPsat(this.psat.inputs);
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
          });
        });
      }
    }
  }

  btnResetData() {
    this.toggleResetData = !this.toggleResetData;
    this.speedForm = this.specificSpeedService.resetForm(this.settings);
    this.calculate();
  }

  btnGenerateExample() {
    this.toggleResetData = !this.toggleResetData;
    this.speedForm = this.specificSpeedService.initForm(this.settings);
    this.calculate();
  }
}
