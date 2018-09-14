import { Component, OnInit, Input, ElementRef, ViewChild, HostListener } from '@angular/core';
import { FSAT } from '../../../shared/models/fans';
import { Settings } from '../../../shared/models/settings';
import { SettingsDbService } from '../../../indexedDb/settings-db.service';
import { FsatService } from '../../../fsat/fsat.service';
import { FanEfficiencyService, FanEfficiencyInputs } from './fan-efficiency.service';
import { FormGroup } from '@angular/forms';
import { Calculator } from '../../../shared/models/calculators';
import { IndexedDbService } from '../../../indexedDb/indexed-db.service';
import { CalculatorDbService } from '../../../indexedDb/calculator-db.service';
import { Assessment } from '../../../shared/models/assessment';

@Component({
  selector: 'app-fan-efficiency',
  templateUrl: './fan-efficiency.component.html',
  styleUrls: ['./fan-efficiency.component.css']
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

  @ViewChild('leftPanelHeader') leftPanelHeader: ElementRef;

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.resizeTabs();
  }

  fanEfficiencyForm: FormGroup;
  headerHeight: number;
  currentField: string;
  toggleCalculate: boolean = true;
  tabSelect: string = 'results';
  fanEfficiency: number = 0;
  calcExists: boolean;
  saving: boolean;
  calculator: Calculator;
  constructor(private fsatService: FsatService, private settingsDbService: SettingsDbService, private fanEfficiencyService: FanEfficiencyService,
    private indexedDbService: IndexedDbService, private calculatorDbService: CalculatorDbService) { }
  
    ngOnInit() {
    if (this.inAssessment) {
      this.getCalculator();
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


  resizeTabs() {
    if (this.leftPanelHeader) {
      if (this.leftPanelHeader.nativeElement.clientHeight) {
        this.headerHeight = this.leftPanelHeader.nativeElement.clientHeight;
      }
    }
  }

  calculate() {
    let tmpFanEfficiencyInputs: FanEfficiencyInputs = this.fanEfficiencyService.getObjFromForm(this.fanEfficiencyForm);
    if (!this.inAssessment) {
      this.fanEfficiencyService.fanEfficiencyInputs = tmpFanEfficiencyInputs;
    } else if (this.inAssessment && this.calcExists) {
      this.calculator.fanEfficiencyInputs = tmpFanEfficiencyInputs;
      this.saveCalculator();
    }

    if (this.fanEfficiencyForm.status == 'VALID') {
      this.fanEfficiency = this.fsatService.optimalFanEfficiency(tmpFanEfficiencyInputs, this.settings);
    } else {
      this.fanEfficiency = 0;
    }
    this.toggleCalculate = !this.toggleCalculate;
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
      if (this.calculator.fanEfficiencyInputs) {
        this.fanEfficiencyForm = this.fanEfficiencyService.initFormFromObj(this.calculator.fanEfficiencyInputs)
      } else {
        if (this.fsat && this.fsat.fanSetup && this.fsat.fanSetup.fanType != 12) {
          this.fanEfficiencyForm = this.fanEfficiencyService.initFormFromFsat(this.fsat);
        } else {
          this.fanEfficiencyForm = this.fanEfficiencyService.initForm();
        }
        let tmpFanEfficiencyInputs: FanEfficiencyInputs = this.fanEfficiencyService.getObjFromForm(this.fanEfficiencyForm);
        this.calculator.fanEfficiencyInputs = tmpFanEfficiencyInputs;
        this.saveCalculator();
      }
    } else {
      this.calculator = this.initCalculator();
      this.saveCalculator();
    }
  }

  initCalculator(): Calculator {
    if (this.fsat && this.fsat.fanSetup && this.fsat.fanSetup.fanType != 12) {
      this.fanEfficiencyForm = this.fanEfficiencyService.initFormFromFsat(this.fsat);
    } else {
      this.fanEfficiencyForm = this.fanEfficiencyService.initForm();
    }
    let tmpFanEfficiencyInputs: FanEfficiencyInputs = this.fanEfficiencyService.getObjFromForm(this.fanEfficiencyForm);
    let tmpCalculator: Calculator = {
      assessmentId: this.assessment.id,
      fanEfficiencyInputs: tmpFanEfficiencyInputs
    }
    return tmpCalculator;
  }

  initForm() {
    if (this.fanEfficiencyService.fanEfficiencyInputs) {
      this.fanEfficiencyForm = this.fanEfficiencyService.initFormFromObj(this.fanEfficiencyService.fanEfficiencyInputs);
    } else {
      this.fanEfficiencyForm = this.fanEfficiencyService.initForm();
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
