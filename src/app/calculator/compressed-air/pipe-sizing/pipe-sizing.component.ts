import { Component, OnInit, ElementRef, ViewChild, HostListener, Input } from '@angular/core';
import { StandaloneService } from "../../standalone.service";
import { PipeSizingInput, PipeSizingOutput } from "../../../shared/models/standalone";
import { Settings } from '../../../shared/models/settings';
import { PipeSizingService } from './pipe-sizing.service';
import { SettingsDbService } from '../../../indexedDb/settings-db.service';
import {Assessment} from '../../../shared/models/assessment';
import {Calculator} from '../../../shared/models/calculators';
import {CalculatorDbService} from '../../../indexedDb/calculator-db.service';
import { AnalyticsService } from '../../../shared/analytics/analytics.service';


@Component({
  selector: 'app-pipe-sizing',
  templateUrl: './pipe-sizing.component.html',
  styleUrls: ['./pipe-sizing.component.css']
})
export class PipeSizingComponent implements OnInit {
  
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
  inputs: PipeSizingInput;
  outputs: PipeSizingOutput;
  currentField: string;
  tabSelect: string = 'results';
  saving: boolean;
  assessmentCalculator: Calculator;

  constructor(private standaloneService: StandaloneService, private pipeSizingService: PipeSizingService, private settingsDbService: SettingsDbService,
    private calculatorDbService: CalculatorDbService,
    private analyticsService: AnalyticsService) {
  }

  ngOnInit() {
    this.analyticsService.sendEvent('calculator-pipe-sizing');
    this.calculatorDbService.isSaving = false;
    if (!this.settings) {
      this.settings = this.settingsDbService.globalSettings;
    }

    if (this.assessment) {
      this.getCalculatorForAssessment();
    } else {
      this.inputs = this.pipeSizingService.inputs;
      this.calculatePipeSize(this.inputs);
    }
  
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

  async calculatePipeSize(inputs: PipeSizingInput) {
    this.outputs = this.standaloneService.pipeSizing(inputs, this.settings);
    if (this.assessmentCalculator) {
      this.assessmentCalculator.pipeSizingInputs = this.inputs;
      await this.calculatorDbService.saveAssessmentCalculator(this.assessment, this.assessmentCalculator);
    } else {
      this.pipeSizingService.inputs = this.inputs;
    }
  }


  setTab(str: string) {
    this.tabSelect = str;
  }

  ngOnDestroy(){
    if (this.assessmentCalculator) {
      this.pipeSizingService.inputs = this.pipeSizingService.getDefaultData();
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
    if (this.assessmentCalculator) {
      if (this.assessmentCalculator.pipeSizingInputs) {
        this.inputs = this.assessmentCalculator.pipeSizingInputs;
      } else {
        this.inputs = this.pipeSizingService.inputs;
        this.assessmentCalculator.pipeSizingInputs = this.inputs;
      }
      this.calculatePipeSize(this.inputs);
    } else {
      this.assessmentCalculator = this.initNewAssessmentCalculator();
      await this.calculatorDbService.saveAssessmentCalculator(this.assessment, this.assessmentCalculator);
    }
  }

 initNewAssessmentCalculator(): Calculator {
    this.inputs = this.pipeSizingService.inputs;
    this.calculatePipeSize(this.inputs);
    let tmpCalculator: Calculator = {
      assessmentId: this.assessment.id,
      pipeSizingInputs: this.inputs
    };
    return tmpCalculator;
  }

  btnResetData() {
    let defaultInputs = this.pipeSizingService.getDefaultData();
    this.pipeSizingService.inputs = defaultInputs;
    this.inputs = defaultInputs;
    this.calculatePipeSize(this.inputs);
  }

  btnGenerateExample() {
    let tempInputs: PipeSizingInput = this.pipeSizingService.getExampleData();
    this.inputs = this.pipeSizingService.convertPipeSizingExample(tempInputs, this.settings);
    this.calculatePipeSize(this.inputs);
  }

  setSmallScreenTab(selectedTab: string) {
    this.smallScreenTab = selectedTab;
  }
}


