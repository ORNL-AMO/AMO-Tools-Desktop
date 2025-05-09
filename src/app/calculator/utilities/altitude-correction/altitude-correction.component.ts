import { Component, ElementRef, HostListener, Input, OnInit, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs';
import { CalculatorDbService } from '../../../indexedDb/calculator-db.service';
import { SettingsDbService } from '../../../indexedDb/settings-db.service';
import { Assessment } from '../../../shared/models/assessment';
import { Calculator } from '../../../shared/models/calculators';
import { Settings } from '../../../shared/models/settings';
import { AltitudeCorrectionService } from './altitude-correction.service';
import { AnalyticsService } from '../../../shared/analytics/analytics.service';

@Component({
    selector: 'app-altitude-correction',
    templateUrl: './altitude-correction.component.html',
    styleUrls: ['./altitude-correction.component.css'],
    standalone: false
})
export class AltitudeCorrectionComponent implements OnInit {
  @Input()
  settings: Settings;
  @Input()
  assessment: Assessment;

  @ViewChild('smallTabSelect', { static: false }) smallTabSelect: ElementRef;
  @ViewChild('leftPanelHeader', { static: false }) leftPanelHeader: ElementRef;  
  @ViewChild('contentContainer', { static: false }) contentContainer: ElementRef;
  @HostListener('window:resize', ['$event'])
  onResize(event) {
    setTimeout(() => {
      this.resizeTabs();
    }, 100);
  }

  smallScreenTab: string = 'form';
  containerHeight: number;
  tabSelect: string = 'help';
  headerHeight: number;
  saving: boolean;
  assessmentCalculator: Calculator;
  
  altitudeCorrectionDataSub: Subscription;
  currentField: string;

  constructor(private settingsDbService: SettingsDbService, 
    private calculatorDbService: CalculatorDbService, 
    private altitudeCorrectionService: AltitudeCorrectionService,
    private analyticsService: AnalyticsService) { }

  ngOnInit() {
    this.analyticsService.sendEvent('calculator-UTIL-altitude-correction');
    this.calculatorDbService.isSaving = false;
    if (!this.settings) {
      this.settings = this.settingsDbService.globalSettings;
    }

    this.altitudeCorrectionService.initDefaultData();
    let existingInputs = this.altitudeCorrectionService.altitudeCorrectionInputs.getValue();
    if (!existingInputs) {
      this.altitudeCorrectionService.initDefaultData();
      this.altitudeCorrectionService.initDefualtResults();
    }
    this.initSubscriptions();

    if (this.assessment) {
      this.getCalculatorForAssessment();
    }
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.resizeTabs();
    }, 100);
  }
  ngOnDestroy() {
    this.altitudeCorrectionDataSub.unsubscribe();
  }

  initSubscriptions() {
    this.altitudeCorrectionDataSub = this.altitudeCorrectionService.altitudeCorrectionInputs.subscribe(updatedInputs => {
      if (updatedInputs){
        this.calculate();
      }
    });
  }

  async calculate() {
    this.altitudeCorrectionService.calculateBarometricPressure(this.settings);
    if (this.assessmentCalculator) {
      this.assessmentCalculator.altitudeCorrectionInput = this.altitudeCorrectionService.altitudeCorrectionInputs.getValue();
      await this.calculatorDbService.saveAssessmentCalculator(this.assessment, this.assessmentCalculator);
     }
  }

  async getCalculatorForAssessment() {
    this.assessmentCalculator = this.calculatorDbService.getByAssessmentId(this.assessment.id);
    if (this.assessmentCalculator) {
      if (this.assessmentCalculator.altitudeCorrectionInput) {
        this.altitudeCorrectionService.altitudeCorrectionInputs.next(this.assessmentCalculator.altitudeCorrectionInput);
      } else {
        this.assessmentCalculator.altitudeCorrectionInput = this.altitudeCorrectionService.altitudeCorrectionInputs.getValue();
      }
    } else{
      this.assessmentCalculator = this.initNewAssessmentCalculator();
      await this.calculatorDbService.saveAssessmentCalculator(this.assessment, this.assessmentCalculator);
    }
  }

  initNewAssessmentCalculator(): Calculator {
    let inputs = this.altitudeCorrectionService.altitudeCorrectionInputs.getValue();
    let tmpCalculator: Calculator = {
      assessmentId: this.assessment.id,
      altitudeCorrectionInput: inputs
    };
    return tmpCalculator;
  }


  resizeTabs() {
    if (this.leftPanelHeader) {
      this.headerHeight = this.leftPanelHeader.nativeElement.offsetHeight;
      this.containerHeight = this.contentContainer.nativeElement.offsetHeight - this.leftPanelHeader.nativeElement.offsetHeight;
      if (this.smallTabSelect && this.smallTabSelect.nativeElement) {
        this.containerHeight = this.containerHeight - this.smallTabSelect.nativeElement.offsetHeight;
      }
    }
  }

  setTab(str: string) {
    this.tabSelect = str;
  }

  btnResetData() {
    this.altitudeCorrectionService.initDefaultData();
    this.altitudeCorrectionService.resetData.next(true);
  }

  btnGenerateExample() {
    this.altitudeCorrectionService.initExampleData(this.settings);
    this.altitudeCorrectionService.generateExample.next(true);
   
  }

  setSmallScreenTab(selectedTab: string) {
    this.smallScreenTab = selectedTab;
  }

}
