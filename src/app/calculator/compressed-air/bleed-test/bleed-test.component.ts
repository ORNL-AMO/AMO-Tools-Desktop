import { Component, ElementRef, HostListener, Input, OnInit, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs';
import { CalculatorDbService } from '../../../indexedDb/calculator-db.service';
import { SettingsDbService } from '../../../indexedDb/settings-db.service';
import { Assessment } from '../../../shared/models/assessment';
import { Calculator } from '../../../shared/models/calculators';
import { Settings } from '../../../shared/models/settings';
import { BleedTestInput } from '../../../shared/models/standalone';
import { BleedTestService } from './bleed-test.service';
import { AnalyticsService } from '../../../shared/analytics/analytics.service';

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
    private analyticsService: AnalyticsService) { }

  ngOnInit(): void {
    this.analyticsService.sendEvent('calculator-CA-bleed-test');
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
      this.containerHeight = this.contentContainer.nativeElement.offsetHeight - this.leftPanelHeader.nativeElement.offsetHeight;
      if (this.smallTabSelect && this.smallTabSelect.nativeElement) {
        this.containerHeight = this.containerHeight - this.smallTabSelect.nativeElement.offsetHeight;
      }
    }
  }

  setTab(str: string) {
    this.tabSelect = str;
  }

  ngOnDestroy(){
    this.bleedTestInputSub.unsubscribe();
  }

  setField(str: string) {
    this.currentField = str;
  }
  
  async getCalculatorForAssessment() {
    this.assessmentCalculator = this.calculatorDbService.getByAssessmentId(this.assessment.id);
    if (this.assessmentCalculator) {
      if (this.assessmentCalculator.bleedTestInputs) {
        this.bleedTestService.bleedTestInput.next(this.assessmentCalculator.bleedTestInputs);
      } else {
        this.assessmentCalculator.bleedTestInputs = this.bleedTestService.bleedTestInput.getValue();
      }
    } else {
      this.assessmentCalculator = this.initNewAssessmentCalculator();
      await this.calculatorDbService.saveAssessmentCalculator(this.assessment, this.assessmentCalculator);
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


  async calculateBleedTest() {
    this.bleedTestService.calculate(this.settings);
    if (this.assessmentCalculator) {
      this.assessmentCalculator.bleedTestInputs = this.bleedTestService.bleedTestInput.getValue();
      await this.calculatorDbService.saveAssessmentCalculator(this.assessment, this.assessmentCalculator);
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

  setSmallScreenTab(selectedTab: string) {
    this.smallScreenTab = selectedTab;
  }
}
