import { Component, OnInit, ElementRef, HostListener, ViewChild, Input } from '@angular/core';
import { StandaloneService } from "../../standalone.service";
import { AirVelocityInput, PipeSizes } from "../../../shared/models/standalone";
import { Settings } from '../../../shared/models/settings';
import { AirVelocityService } from './air-velocity.service';
import { SettingsDbService } from '../../../indexedDb/settings-db.service';
import {Assessment} from '../../../shared/models/assessment';
import {Calculator} from '../../../shared/models/calculators';
import {CalculatorDbService} from '../../../indexedDb/calculator-db.service';
import { AnalyticsService } from '../../../shared/analytics/analytics.service';


@Component({
    selector: 'app-air-velocity',
    templateUrl: './air-velocity.component.html',
    styleUrls: ['./air-velocity.component.css'],
    standalone: false
})
export class AirVelocityComponent implements OnInit {

  @Input()
  settings: Settings;
  @Input()
  assessment: Assessment;

  @ViewChild('contentContainer', { static: false }) contentContainer: ElementRef;
  @ViewChild('smallTabSelect', { static: false }) smallTabSelect: ElementRef;
  @ViewChild('leftPanelHeader', { static: false }) leftPanelHeader: ElementRef;

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    setTimeout(() => {
      this.resizeTabs();
    }, 100);
  }

  smallScreenTab: string = 'form';
  containerHeight: number;
  headerHeight: number;
  inputs: AirVelocityInput;
  outputs: PipeSizes;
  currentField: string;
  tabSelect: string = 'results';
  saving: boolean;
  assessmentCalculator: Calculator;

  constructor(private airVelocityService: AirVelocityService, private standaloneService: StandaloneService, private settingsDbService: SettingsDbService,
    private calculatorDbService: CalculatorDbService,
    private analyticsService: AnalyticsService) { }

  ngOnInit() {
    this.analyticsService.sendEvent('calculator-CA-air-velocity');
    this.calculatorDbService.isSaving = false;
    if (!this.settings) {
      this.settings = this.settingsDbService.globalSettings;
    }
    if(this.assessment) {
      this.getCalculatorForAssessment();
    } else{
    this.inputs = this.airVelocityService.airVelocityInputs;
    this.getAirVelocity(this.inputs);
  }
}
  ngAfterViewInit() {
    setTimeout(() => {
      this.resizeTabs();
    }, 100);
  }

  resizeTabs() {
    if (this.leftPanelHeader.nativeElement.clientHeight) {
      this.headerHeight = this.leftPanelHeader.nativeElement.clientHeight;this.containerHeight = this.contentContainer.nativeElement.offsetHeight - this.leftPanelHeader.nativeElement.offsetHeight;
      if (this.smallTabSelect && this.smallTabSelect.nativeElement) {
        this.containerHeight = this.containerHeight - this.smallTabSelect.nativeElement.offsetHeight;
      }
    }
  }

  async getAirVelocity(inputs: AirVelocityInput) {
    this.outputs = this.standaloneService.airVelocity(inputs, this.settings);
     if(this.assessmentCalculator) {
       this.assessmentCalculator.airVelocityInputs = this.inputs;
      await this.calculatorDbService.saveAssessmentCalculator(this.assessment, this.assessmentCalculator);
     }else{
       this.airVelocityService.airVelocityInputs = this.inputs;
     }
  }

  setTab(str: string) {
    this.tabSelect = str;
  }

  ngOnDestroy() {
    if(this.assessmentCalculator) {
      this.airVelocityService.airVelocityInputs = this.airVelocityService.getDefault();
    }
  }

  setField(str: string) {
    this.currentField = str;
  }

  changeField(str: string) {
    this.currentField = str;
  }

  async getCalculatorForAssessment() {
    this.assessmentCalculator = this.calculatorDbService.getByAssessmentId(this.assessment.id);
    if(this.assessmentCalculator) {
      if (this.assessmentCalculator.airVelocityInputs) {
        this.inputs = this.assessmentCalculator.airVelocityInputs;
        this.getAirVelocity(this.inputs);
      } else {
        this.inputs = this.airVelocityService.airVelocityInputs;
        this.assessmentCalculator.airVelocityInputs = this.inputs;
        this.getAirVelocity(this.inputs);
      }
    }else{
      this.assessmentCalculator = this.initNewAssessmentCalculator();
     await this.calculatorDbService.saveAssessmentCalculator(this.assessment, this.assessmentCalculator);
    }
  }

  initNewAssessmentCalculator(): Calculator {
    this.inputs = this.airVelocityService.airVelocityInputs;
    this.getAirVelocity(this.inputs);
    let tmpCalculator: Calculator = {
      assessmentId: this.assessment.id,
      airVelocityInputs: this.inputs
    };
    return tmpCalculator;
  }


  btnResetData() {
    let defaultInputs = this.airVelocityService.getDefault();
    this.airVelocityService.airVelocityInputs = defaultInputs;
    this.inputs = defaultInputs;
    this.getAirVelocity(this.inputs);
  }

  //provide functionality to "Generate Example" button,
  //reset data function should have most of the structure already
  btnGenerateExample() {
    let tmpInputs: AirVelocityInput = this.airVelocityService.getExample();
    this.inputs = this.airVelocityService.convertAirVelocityExample(tmpInputs, this.settings);
    this.getAirVelocity(this.inputs);
  }

  setSmallScreenTab(selectedTab: string) {
    this.smallScreenTab = selectedTab;
  }
 

  
}



