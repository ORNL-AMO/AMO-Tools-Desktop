import { Component, ElementRef, HostListener, Input, OnInit, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs';
import { CalculatorDbService } from '../../../indexedDb/calculator-db.service';
import { IndexedDbService } from '../../../indexedDb/indexed-db.service';
import { SettingsDbService } from '../../../indexedDb/settings-db.service';
import { Assessment } from '../../../shared/models/assessment';
import { Calculator } from '../../../shared/models/calculators';
import { Settings } from '../../../shared/models/settings';
import { BleedTestInput } from '../../../shared/models/standalone';
import { StandaloneService } from '../../standalone.service';
import { BleedTestService } from './bleed-test.service';

@Component({
  selector: 'app-bleed-test',
  templateUrl: './bleed-test.component.html',
  styleUrls: ['./bleed-test.component.css']
})
export class BleedTestComponent implements OnInit {

  @Input()
  settings: Settings;
  @Input()
  assessment: Assessment;

  @ViewChild('leftPanelHeader', { static: false }) leftPanelHeader: ElementRef;

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.resizeTabs();
  }

  headerHeight: number;
  bleedTestInput: BleedTestInput;
  bleedTestInputSub: Subscription;
  currentField: string;
  tabSelect: string = 'results';
  saving: boolean;
  assessmentCalculator: Calculator;

  constructor(private standaloneService: StandaloneService,
    private bleedTestService: BleedTestService,
    private settingsDbService: SettingsDbService,
    private calculatorDbService: CalculatorDbService,
    private indexedDbService: IndexedDbService) { }

  ngOnInit() {
    if (!this.settings) {
      this.settings = this.settingsDbService.globalSettings;
    }
    this.bleedTestInput = this.bleedTestService.bleedTestInput.value;
    if(!this.bleedTestInput){
      this.bleedTestService.initDefaultEmptyInputs();
    }
    this.initSubscriptions();
    if (this.assessment) {
      this.getCalculatorForAssessment();
    } else {
      this.bleedTestInput = this.bleedTestService.inputs;
      this.calculateBleedTest(this.bleedTestInput);
    }
  }

  initSubscriptions() {
    this.bleedTestInputSub = this.bleedTestService.bleedTestInput.subscribe(value => {
      this.bleedTestInput = value;
      this.calculateBleedTest(this.bleedTestInput);
    })
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

  setTab(str: string) {
    this.tabSelect = str;
  }

  ngOnDestroy(){
    if (this.assessmentCalculator) {
      this.bleedTestService.inputs = this.bleedTestService.getDefaultData();
    }
    this.bleedTestInputSub.unsubscribe();
  }

  setField(str: string) {
    this.currentField = str;
  }

  changeField(str: string) {
    this.currentField = str;
  }

  getCalculatorForAssessment() {
    this.assessmentCalculator = this.calculatorDbService.getByAssessmentId(this.assessment.id);
    if (this.assessmentCalculator) {
      if (this.assessmentCalculator.bleedTestInputs) {
        this.bleedTestInput = this.assessmentCalculator.bleedTestInputs;
      } else {
        this.bleedTestInput = this.bleedTestService.inputs;
        this.assessmentCalculator.bleedTestInputs = this.bleedTestInput;
      }
      this.calculateBleedTest(this.bleedTestInput);
    } else {
      this.assessmentCalculator = this.initNewAssessmentCalculator();
      this.saveAssessmentCalculator();
    }
  }

  initNewAssessmentCalculator(): Calculator {
    this.bleedTestInput = this.bleedTestService.inputs;
    this.calculateBleedTest(this.bleedTestInput);
    let tmpCalculator: Calculator = {
      assessmentId: this.assessment.id,
      bleedTestInputs: this.bleedTestInput
    };
    return tmpCalculator;
  }


  calculateBleedTest(bleedTestInput: BleedTestInput) {
    this.bleedTestService.calculate(bleedTestInput, this.settings);
    if (this.assessmentCalculator) {
      this.assessmentCalculator.bleedTestInputs = this.bleedTestInput;
      this.saveAssessmentCalculator();
    } else {
      this.bleedTestService.inputs = this.bleedTestInput;
    }
  }

  saveAssessmentCalculator() {
    if (!this.saving) {
      if (this.assessmentCalculator.id) {
        this.indexedDbService.putCalculator(this.assessmentCalculator).then(() => {
          this.calculatorDbService.setAll();
        });
      } else {
        this.saving = true;
        this.assessmentCalculator.assessmentId = this.assessment.id;
        this.indexedDbService.addCalculator(this.assessmentCalculator).then((result) => {
          this.calculatorDbService.setAll().then(() => {
            this.assessmentCalculator.id = result;
            this.saving = false;
          });
        });
      }
    }
  }

  btnResetData() {
    this.bleedTestService.initDefaultEmptyInputs();
    this.bleedTestService.resetData.next(true);
  }

  btnGenerateExample() {
    this.bleedTestService.getExampleData();
    this.bleedTestService.generateExample.next(true);
  }

}
