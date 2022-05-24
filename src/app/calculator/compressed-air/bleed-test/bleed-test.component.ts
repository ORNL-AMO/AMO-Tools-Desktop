import { Component, ElementRef, HostListener, Input, OnInit, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs';
import { CalculatorDbService } from '../../../indexedDb/calculator-db.service';
import { IndexedDbService } from '../../../indexedDb/indexed-db.service';
import { SettingsDbService } from '../../../indexedDb/settings-db.service';
import { Assessment } from '../../../shared/models/assessment';
import { Calculator } from '../../../shared/models/calculators';
import { Settings } from '../../../shared/models/settings';
import { BleedTestInput } from '../../../shared/models/standalone';
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
  bleedTestInputSub: Subscription;
  currentField: string;
  tabSelect: string = 'results';
  saving: boolean;
  assessmentCalculator: Calculator;

  constructor(
    private bleedTestService: BleedTestService,
    private settingsDbService: SettingsDbService,
    private calculatorDbService: CalculatorDbService,
    private indexedDbService: IndexedDbService) { }

  ngOnInit(): void {
    if (!this.settings) {
      this.settings = this.settingsDbService.globalSettings;
    }
    this.bleedTestService.initDefaultEmptyInputs();
    this.initSubscriptions();
    if (this.assessment) {
      this.getCalculatorForAssessment();
    } 
  }

  initSubscriptions() {
    this.bleedTestInputSub = this.bleedTestService.bleedTestInput.subscribe(value => {
      if(value){
        this.calculateBleedTest();
      }
    });
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
    if (this.assessment) {
      this.saveAssessmentCalculator();
    }
    this.bleedTestInputSub.unsubscribe();
  }

  setField(str: string) {
    this.currentField = str;
  }
  
  getCalculatorForAssessment() {
    this.assessmentCalculator = this.calculatorDbService.getByAssessmentId(this.assessment.id);
    if (this.assessmentCalculator) {
      if (this.assessmentCalculator.bleedTestInputs) {
        this.bleedTestService.bleedTestInput.next(this.assessmentCalculator.bleedTestInputs);
      } else {
        this.assessmentCalculator.bleedTestInputs = this.bleedTestService.bleedTestInput.getValue();
      }
    } else {
      this.assessmentCalculator = this.initNewAssessmentCalculator();
      this.saveAssessmentCalculator();
    }
  }

  initNewAssessmentCalculator(): Calculator {
    let bleedTestInput: BleedTestInput = this.bleedTestService.bleedTestInput.getValue();
    let newCalculator: Calculator = {
      assessmentId: this.assessment.id,
      bleedTestInputs: bleedTestInput
    };
    return newCalculator;
  }


  calculateBleedTest() {
    this.bleedTestService.calculate(this.settings);
    if (this.assessmentCalculator) {
      this.assessmentCalculator.bleedTestInputs = this.bleedTestService.bleedTestInput.getValue();
      this.saveAssessmentCalculator();
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
    this.bleedTestService.getExampleData(this.settings);
    this.bleedTestService.generateExample.next(true);
  }

}
